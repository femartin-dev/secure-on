import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { API_CONFIG } from '../config/api-config';
import { LocationData } from '../models/evidence.models';


export interface QueueItem {
  id: string;
  data: any;
  timestamp: number;
  status: 'SEND' | 'PENDING' | 'FAILED';
}

@Injectable({
  providedIn: 'root',
})
export class QueueService {
  private async queueData(data: any, key: string): Promise<void> {
    const element: QueueItem = {
      id: this.generateId(),
      data,
      timestamp: Date.now(),
      status: 'PENDING',
    };
    const queueStr = await Preferences.get({ key });
    const queue = queueStr.value ? JSON.parse(queueStr.value) : [];
    queue.push(element);
    await Preferences.set({ key, value: JSON.stringify(queue) });
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  private async getNextFromQueue(
    key: string,
    status: string,
    negateStatus: boolean = false
  ): Promise<QueueItem | null> {
    const queueStr = await Preferences.get({ key });
    const queue = queueStr.value ? JSON.parse(queueStr.value) : [];
    const result = queue
      .filter((e: QueueItem) => (negateStatus ? e.status !== status : e.status === status))
      .reduce((o: QueueItem, n: QueueItem) => (n.timestamp < o.timestamp ? n : o), null);
    return result;
  }

  private async changeDataStatusInQueue(
    key: string,
    id: string,
    status: 'SEND' | 'PENDING' | 'FAILED'
  ): Promise<void> {
    const queueStr = await Preferences.get({ key });
    const queue = queueStr.value ? JSON.parse(queueStr.value) : [];
    let item = queue.find((e: QueueItem) => e.id === id);
    if (item) {
      item.status = status;
      await Preferences.set({ key, value: JSON.stringify(queue) });
    }
  }

  private async dequeueData(
    key: string,
    id?: string,
    status?: 'SEND' | 'PENDING' | 'FAILED',
    before?: number,
    after?: number
  ): Promise<void> {
    if (!id && !status && !before && !after) {
      throw new Error('Al menos debe proveer un parametro para eliminar datos de la cola.');
    }
    const queueStr = await Preferences.get({ key });
    const queue = queueStr.value ? JSON.parse(queueStr.value) : [];
    const newQueue = queue.filter(
      (e: QueueItem) =>
        (!id || e.id !== id) &&
        (!status || e.status !== status) &&
        (!before || e.timestamp >= before) &&
        (!after || e.timestamp <= after)
    );
    await Preferences.set({ key, value: JSON.stringify(newQueue) });
  }

  private async clearQueue(key: string): Promise<void> {
    await Preferences.remove({ key });
  }

  public async queueLocation(location: LocationData): Promise<void> {
    await this.queueData(location, API_CONFIG.LOCATION_QUEUE_KEY);
  }

  public async queuePhoto(photo: any): Promise<void> {
    await this.queueData(photo, API_CONFIG.PHOTO_QUEUE_KEY);
  }

  public async queueAudio(audio: any): Promise<void> {
    await this.queueData(audio, API_CONFIG.AUDIO_QUEUE_KEY);
  }

  public async getNextLocation(): Promise<QueueItem | null> {
    return await this.getNextFromQueue(API_CONFIG.LOCATION_QUEUE_KEY, 'SEND', true);
  }

  public async getNextPhoto(): Promise<QueueItem | null> {
    return await this.getNextFromQueue(API_CONFIG.PHOTO_QUEUE_KEY, 'SEND', true);
  }

  public async getNextAudio(): Promise<QueueItem | null> {
    return await this.getNextFromQueue(API_CONFIG.AUDIO_QUEUE_KEY, 'SEND', true);
  }

  public async changeLocationStatus(id: string, status: 'SEND' | 'PENDING' | 'FAILED'): Promise<void> {
    await this.changeDataStatusInQueue(API_CONFIG.LOCATION_QUEUE_KEY, id, status);
  }

  public async changePhotoStatus(id: string, status: 'SEND' | 'PENDING' | 'FAILED'): Promise<void> {
    await this.changeDataStatusInQueue(API_CONFIG.PHOTO_QUEUE_KEY, id, status);
  }

  public async changeAudioStatus(id: string, status: 'SEND' | 'PENDING' | 'FAILED'): Promise<void> {
    await this.changeDataStatusInQueue(API_CONFIG.AUDIO_QUEUE_KEY, id, status);
  }

  public async dequeueLocation(id: string, status: 'SEND' | 'FAILED'): Promise<void> {
    await this.dequeueData(API_CONFIG.LOCATION_QUEUE_KEY, id, status);
  }

  public async dequeuePhoto(id: string, status: 'SEND' | 'FAILED'): Promise<void> {
    await this.dequeueData(API_CONFIG.PHOTO_QUEUE_KEY, id, status);
  }

  public async dequeueAudio(id: string, status: 'SEND' | 'FAILED'): Promise<void> {
    await this.dequeueData(API_CONFIG.AUDIO_QUEUE_KEY, id, status);
  }

  private async commonPurge(key: string): Promise<void> {
    const deleteSendAfter = Date.now() - 1000 * 60 * 60 * 24 * 3;
    await this.dequeueData(key, undefined, 'SEND', undefined, deleteSendAfter);
    const deleteAnyAfter = Date.now() - 1000 * 60 * 60 * 24 * 30;
    await this.dequeueData(key, undefined, undefined, undefined, deleteAnyAfter);
  }

  public async purgeLocation(): Promise<void> {
    await this.commonPurge(API_CONFIG.LOCATION_QUEUE_KEY);
  }

  public async purgePhoto(): Promise<void> {
    await this.commonPurge(API_CONFIG.PHOTO_QUEUE_KEY);
  }

  public async purgeAudio(): Promise<void> {
    await this.commonPurge(API_CONFIG.AUDIO_QUEUE_KEY);
  }
}
