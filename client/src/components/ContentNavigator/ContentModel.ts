// Copyright © 2023, SAS Institute Inc., Cary, NC, USA. All Rights Reserved.
// Licensed under SAS Code Extension Terms, available at Code_Extension_Agreement.pdf

import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { authentication, Uri } from "vscode";
import { SASAuthProvider } from "../AuthProvider";
import {
  FAVORITES_FOLDER,
  FILE_TYPE,
  FILE_TYPES,
  FOLDER_TYPE,
  FOLDER_TYPES,
  Messages,
  ROOT_FOLDER,
  TRASH_FOLDER,
} from "./const";
import { ContentItem, Link, Permission } from "./types";
import { getLink, getResourceId, getTypeName, getUri } from "./utils";

interface AddMemberProperties {
  name?: string;
  contentType?: string;
}

export class ContentModel {
  private connection: AxiosInstance;
  private fileTokenMaps: {
    [id: string]: { etag: string; lastModified: string };
  };
  private authorized: boolean;
  private delegateFolders: { [name: string]: ContentItem };

  constructor() {
    this.fileTokenMaps = {};
    this.authorized = false;
    this.delegateFolders = {};
  }

  public async connect(baseURL: string): Promise<void> {
    this.connection = axios.create({ baseURL });
    this.connection.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const originalRequest: AxiosRequestConfig & { _retry?: boolean } =
          error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          await this.updateAccessToken();
          return this.connection(originalRequest);
        }

        return Promise.reject(error);
      }
    );
    await this.updateAccessToken();
    this.authorized = true;
  }

  public async getChildren(item?: ContentItem): Promise<ContentItem[]> {
    if (!this.authorized) {
      return [];
    }

    if (!item) {
      return this.getRootChildren();
    }

    const parentIsContent = item.uri === ROOT_FOLDER.uri;
    const typeQuery = this.generateTypeQuery(parentIsContent);

    const membersLink = getLink(item.links, "GET", "members");
    let membersUrl = membersLink ? membersLink.uri : null;
    if (!membersUrl && item.uri) {
      membersUrl = `${item.uri}/members`;
    }

    if (!membersUrl) {
      const selfLink = getLink(item.links, "GET", "self");
      if (!selfLink) {
        console.error(
          "Invalid state: FolderService object has no self link : " + item.name
        );
        return Promise.reject({ status: 404 });
      }
      membersUrl = selfLink.uri + "/members";
    }

    membersUrl = membersUrl + "?limit=1000000";

    const filters = [];

    if (parentIsContent) {
      filters.push("isNull(parent)");
    }
    if (typeQuery) {
      filters.push(typeQuery);
    }

    if (filters.length === 1) {
      membersUrl = membersUrl + "&filter=" + filters[0];
    } else if (filters.length > 1) {
      membersUrl = membersUrl + "&filter=and(" + filters.join(",") + ")";
    }

    const res = await this.connection.get(membersUrl);
    const result = res.data;
    if (!result.items) {
      return Promise.reject();
    }
    const isTrash = TRASH_FOLDER === getTypeName(item) || item.__trash__;

    return result.items.map((childItem: ContentItem) => ({
      ...childItem,
      uid: `${childItem.id}${item.name}`.replace(/\s/g, ""),
      permission: getPermission(childItem),
      __trash__: isTrash,
    }));
  }

  public async getParent(item: ContentItem): Promise<ContentItem | undefined> {
    const ancestorsLink = getLink(item.links, "GET", "ancestors");
    if (!ancestorsLink) {
      return;
    }

    const resp = await this.connection.get(ancestorsLink.uri);
    if (resp.data.ancestors && resp.data.ancestors.length > 0) {
      return resp.data.ancestors[0];
    }
  }

  public async getResourceByUri(uri: Uri): Promise<ContentItem> {
    const resourceId = getResourceId(uri);
    const res = await this.connection.get(resourceId);
    this.fileTokenMaps[resourceId] = {
      etag: res.headers.etag,
      lastModified: res.headers["last-modified"],
    };

    return res.data;
  }

  public async getContentByUri(uri: Uri): Promise<string> {
    const resourceId = getResourceId(uri);
    const res = await this.connection.get(resourceId + "/content", {
      transformResponse: (response) => response,
    });
    this.fileTokenMaps[resourceId] = {
      etag: res.headers.etag,
      lastModified: res.headers["last-modified"],
    };

    // We expect the returned data to be a string. If this isn't a string,
    // we can't really open it
    if (typeof res.data === "object") {
      throw new Error(Messages.FileOpenError);
    }

    return res.data;
  }

  public async createFile(
    item: ContentItem,
    fileName: string
  ): Promise<ContentItem | undefined> {
    const contentType = await this.getFileContentType(fileName);
    let createdResource: ContentItem;
    try {
      const fileCreationResponse = await this.connection.post<ContentItem>(
        `/files/files#rawUpload?typeDefName=${contentType}`,
        Buffer.from("", "binary"),
        {
          headers: {
            "Content-Type": "text/plain",
            "Content-Disposition": `filename*=UTF-8''${encodeURI(fileName)}`,
            Accept: "application/vnd.sas.file+json",
          },
        }
      );
      createdResource = fileCreationResponse.data;
    } catch (error) {
      return;
    }

    const fileLink: Link | null = getLink(createdResource.links, "GET", "self");

    const memberAdded = await this.addMember(
      fileLink?.uri,
      getLink(item.links, "POST", "addMember")?.uri,
      {
        name: fileName,
        contentType,
      }
    );
    if (!memberAdded) {
      return;
    }

    return createdResource;
  }

  public async createFolder(
    item: ContentItem,
    name: string
  ): Promise<ContentItem | undefined> {
    const parentFolderUri =
      item.uri || getLink(item.links || [], "GET", "self")?.uri || null;
    if (!parentFolderUri) {
      return;
    }

    try {
      const createFolderResponse = await this.connection.post(
        `/folders/folders?parentFolderUri=${parentFolderUri}`,
        {
          name,
        }
      );
      return createFolderResponse.data;
    } catch (error) {
      return;
    }
  }

  public async renameResource(
    item: ContentItem,
    name: string
  ): Promise<ContentItem | undefined> {
    const itemIsReference = item.type === "reference";
    const uri = itemIsReference
      ? getLink(item.links, "GET", "self").uri
      : item.uri;

    try {
      // not sure why but the response of moveTo request does not return the latest etag so request it every time
      const res = await this.connection.get(uri);
      const fileTokenMap = {
        etag: res.headers.etag,
        lastModified: res.headers["last-modified"],
      };

      const validationUri = getLink(item.links, "PUT", "validateRename")?.uri;
      if (validationUri) {
        await this.connection.put(
          validationUri
            .replace("{newname}", encodeURI(name))
            .replace("{newtype}", getTypeName(item))
        );
      }

      const patchResponse = await this.connection.patch(
        uri,
        { name },
        {
          headers: {
            "If-Unmodified-Since": fileTokenMap.lastModified,
            "If-Match": fileTokenMap.etag,
          },
        }
      );
      this.fileTokenMaps[uri] = {
        etag: patchResponse.headers.etag,
        lastModified: patchResponse.headers["last-modified"],
      };

      // The links in My Favorites are of type reference. Instead of passing
      // back the reference objects, we want to pass back the underlying source
      // objects.
      if (itemIsReference) {
        const referencedItem = await this.connection.get(item.uri);
        return referencedItem.data;
      }

      return patchResponse.data;
    } catch (error) {
      return;
    }
  }

  public async saveContentToUri(uri: Uri, content: string): Promise<void> {
    const resourceId = getResourceId(uri);
    const res = await this.connection.put(resourceId + "/content", content, {
      headers: {
        "Content-Type": "text/plain",
        "If-Match": this.fileTokenMaps[resourceId].etag,
        "If-Unmodified-Since": this.fileTokenMaps[resourceId].lastModified,
      },
    });
    this.fileTokenMaps[resourceId] = {
      etag: res.headers.etag,
      lastModified: res.headers["last-modified"],
    };
  }

  public async getUri(item: ContentItem, readOnly: boolean): Promise<Uri> {
    if (item.type !== "reference") {
      return getUri(item, readOnly);
    }

    // If we're attempting to open a favorite, open the underlying file instead.
    try {
      const resp = await this.connection.get(item.uri);
      return getUri(resp.data, readOnly);
    } catch (error) {
      return getUri(item, readOnly);
    }
  }

  public async delete(item: ContentItem): Promise<boolean> {
    const link = item.links.find((link: Link) => link.rel === "deleteResource");
    if (!link) {
      return false;
    }

    try {
      await this.connection.delete(link.uri);
    } catch (error) {
      return false;
    }
    // delete the resource or move item to recycle bin will automatically delete the favorites as well.
    return true;
  }

  public async moveTo(
    item: ContentItem,
    targetParentFolderUri: string
  ): Promise<boolean> {
    const newItemData = {
      ...item,
      parentFolderUri: targetParentFolderUri,
    };
    const updateLink = getLink(item.links, "PUT", "update");
    try {
      await this.connection.put(updateLink.uri, newItemData);
    } catch (error) {
      return false;
    }
    return true;
  }

  private async addMember(
    uri: string | undefined,
    addMemberUri: string | undefined,
    properties: AddMemberProperties
  ): Promise<boolean> {
    if (!uri || !addMemberUri) {
      return false;
    }

    try {
      await this.connection.post(addMemberUri, {
        uri,
        type: "CHILD",
        ...properties,
      });
    } catch (error) {
      return false;
    }

    return true;
  }

  private generateTypeQuery(parentIsContent: boolean): string {
    // Generate type query segment if applicable
    let typeQuery = "";
    // Determine the set of types on which to filter
    const includedTypes = FILE_TYPES.concat(FOLDER_TYPES);

    // Generate type query string
    typeQuery = "in(" + (parentIsContent ? "type" : "contentType") + ",";
    for (let i = 0; i < includedTypes.length; i++) {
      typeQuery += "'" + includedTypes[i] + "'";
      if (i !== includedTypes.length - 1) {
        typeQuery += ",";
      }
    }
    typeQuery += ")";

    return typeQuery;
  }

  private async getFileContentType(fileName: string): Promise<string> {
    const defaultContentType = "file";
    const ext = fileName.split(".").pop().toLowerCase();
    if (ext === "sas") {
      return "programFile";
    }

    try {
      const typeResponse = await this.connection.get(
        `/types/types?filter=contains('extensions', '${ext}')`
      );

      if (typeResponse.data.items && typeResponse.data.items.length !== 0) {
        return typeResponse.data.items[0].name;
      }
    } catch {
      return defaultContentType;
    }

    return defaultContentType;
  }

  private async getRootChildren(): Promise<ContentItem[]> {
    const supportedDelegateFolders = [
      "@myFavorites",
      "@myFolder",
      "@sasRoot",
      "@myRecycleBin",
    ];
    let numberCompletedServiceCalls = 0;

    return new Promise<ContentItem[]>((resolve) => {
      supportedDelegateFolders.forEach(async (sDelegate) => {
        let result;
        if (sDelegate === "@sasRoot") {
          result = {
            data: ROOT_FOLDER,
          };
        } else {
          result = await this.connection.get(`/folders/folders/${sDelegate}`);
        }
        this.delegateFolders[sDelegate] = {
          ...result.data,
          permission: getPermission(result.data),
        };

        numberCompletedServiceCalls++;
        if (numberCompletedServiceCalls === supportedDelegateFolders.length) {
          resolve(
            Object.entries(this.delegateFolders)
              .sort(
                // sort the delegate folders as the order in the supportedDelegateFolders
                (a, b) =>
                  supportedDelegateFolders.indexOf(a[0]) -
                  supportedDelegateFolders.indexOf(b[0])
              )
              .map((entry) => entry[1])
          );
        }
      });
    });
  }

  public getDelegateFolder(name: string): ContentItem | undefined {
    return this.delegateFolders[name];
  }

  private async updateAccessToken(): Promise<void> {
    const session = await authentication.getSession(SASAuthProvider.id, [], {
      createIfNone: true,
    });
    this.connection.defaults.headers.common.Authorization = `Bearer ${session.accessToken}`;
  }
}

const getPermission = (item: ContentItem): Permission => {
  const itemType = getTypeName(item);
  return [FOLDER_TYPE, FILE_TYPE].includes(itemType) // normal folders and files
    ? {
        write: !!getLink(item.links, "PUT", "update"),
        delete: !!getLink(item.links, "DELETE", "deleteResource"),
        addMember: !!getLink(item.links, "POST", "createChild"),
      }
    : {
        // delegate folders, user folder and user root folder
        write: false,
        delete: false,
        addMember:
          itemType !== TRASH_FOLDER &&
          itemType !== FAVORITES_FOLDER &&
          !!getLink(item.links, "POST", "createChild"),
      };
};
