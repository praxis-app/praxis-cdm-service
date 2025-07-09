import axios, { AxiosInstance, AxiosResponse, Method } from 'axios';

class MatrixClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: `${process.env.MATRIX_HS_URL || 'http://localhost:8008'}/_matrix/client/r0`,
    });
  }

  joinRoom = async (roomId: string) => {
    return this.executeRequest<{ room_id: string }>(
      'post',
      `/rooms/${encodeURIComponent(roomId)}/join`,
    );
  };

  getRoomMessages = async (roomId: string, limit: number = 20) => {
    return this.executeRequest<{ chunk: Array<Record<string, unknown>> }>(
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

  private async executeRequest<T = void>(
    method: Method,
    path: string,
    options?: { data?: any; params?: any; responseType?: any },
  ): Promise<T> {
    try {
      const token = process.env.MATRIX_AS_TOKEN;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

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

export const api = new MatrixClient();
