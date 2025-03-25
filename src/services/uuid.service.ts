import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

@Injectable()
export class UUIDService {
  generateUuidFromIdentifier(identifier: string): string {
    if (!identifier) {
      return uuidv4(); 
    }

    const hash = crypto.createHash('sha256');
    const hashedIdentifier = hash.digest('hex');
    return hashedIdentifier;
  }

  generateRandomUuid(): string {
    return uuidv4();
  }
}