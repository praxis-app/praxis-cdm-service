import axios, { AxiosInstance, AxiosResponse, Method } from 'axios';
import { config } from '../config/config';

class MatrixClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: `${config.matrix.hsUrl}/_matrix/client/v3`,
    });
  }

  getRoomMessages = async (roomId: string, limit: number = 20) => {
    return this.executeRequest<{ chunk: Record<string, unknown>[] }>(
      'get',
      `/rooms/${encodeURIComponent(roomId)}/messages`,
      { params: { limit, dir: 'b' } },
    );
  };

  sendBotMessage = async (roomId: string, message: string) => {
    return this.executeRequest(
      'post',
      `/rooms/${encodeURIComponent(roomId)}/send/m.room.message`,
      { data: { msgtype: 'm.text', body: message } },
    );
  };

  setStateEvent = async (
    roomId: string,
    eventType: string,
    stateKey: string,
    content: Record<string, unknown>,
  ) => {
    const roomPath = `/rooms/${encodeURIComponent(roomId)}`;
    const statePath = `/state/${encodeURIComponent(eventType)}/${encodeURIComponent(stateKey)}`;
    return this.executeRequest('put', `${roomPath}${statePath}`, {
      data: content,
    });
  };

  private async executeRequest<T = void>(
    method: Method,
    path: string,
    options?: { data?: any; params?: any; responseType?: any },
  ): Promise<T> {
    try {
      const { asToken } = config.matrix;
      const headers = asToken ? { Authorization: `Bearer ${asToken}` } : {};

      const response: AxiosResponse<T> = await this.axiosInstance.request<T>({
        method,
        url: path,
        data: options?.data,
        params: options?.params,
        responseType: options?.responseType,
        headers,
      });

      return response.data;
    } catch (error) {
      console.error(`API request error: ${error}`);
      throw error;
    }
  }
}

export const matrixClient = new MatrixClient();
