import { Injectable } from '@nestjs/common';

@Injectable()
export class UtilsService {
  parsePageNumberAndGetlimitAndOffset(
    page: string,
    limit: number = 10,
  ): {
    offset: number;
    limit: number;
  } {
    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const offset = (pageNumber - 1) * limit;

    return {
      offset,
      limit,
    };
  }
}
