import axios, { AxiosInstance } from "axios";
import { HttpAdapter } from "../interfaces/http-adapter.interfaces";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AxiosAdapter implements HttpAdapter {

  private axios: AxiosInstance = axios
  constructor() {
    this.axios = axios.create({
      baseURL: 'https://pokeapi.co/api/v2',
      timeout: 5000,
    });

  }
  async get<T>(url: string): Promise<T> {
    try {
      const { data } = await this.axios.get<T>(url);
      return data;
    } catch (error) {
      throw new Error(`Error HttpAdapter - fetching data from ${url}: ${error.message}`);
    }
  }
}