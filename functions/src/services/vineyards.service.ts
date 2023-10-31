import { SharingOpts, SharingPermission } from '../models/sharing.model';
import { db } from './utils.service';

const addPermissions = async (
  ownerId: string,
  vineyardId: string,
  user: string,
  permissions: SharingPermission
): Promise<void> => {
  try {
    console.log(`Adding permissions ${permissions} to vineyard ${vineyardId} of ${ownerId} for user ${user}`);
    await db
      .collection('users')
      .doc(ownerId)
      .collection('vineyards')
      .doc(vineyardId)
      .collection('permissions')
      .doc(user)
      .set({
        permissions,
      });
  } catch (error) {
    console.error(`Could not add permissions to ${vineyardId} of ${ownerId}`, error);
    throw error;
  }
};

const addSharedVineyard = async (userId: string, ownerId: string, vineyardId: string) => {
  try {
    console.log(`Adding vineyard ${vineyardId} of ${ownerId} to shared vineyards of ${userId}`);
    await db.collection('users').doc(userId).collection('sharedVineyards').doc(vineyardId).set({
      user: ownerId,
      vineyard: vineyardId,
    });
  } catch (error) {
    console.error(`Could not add ${vineyardId} of ${ownerId} to shared vineyards of ${userId}`, error);
    throw error;
  }
};
const deletePermissions = async (ownerId: string, vineyardId: string, user: string): Promise<void> => {
  try {
    console.log(`Removing permissions from vineyard ${vineyardId} of ${ownerId} for user ${user}`);
    await db
      .collection('users')
      .doc(ownerId)
      .collection('vineyards')
      .doc(vineyardId)
      .collection('permissions')
      .doc(user)
      .delete();
  } catch (error) {
    console.error(`Could not remove permissions from ${vineyardId} of ${ownerId}`, error);
    throw error;
  }
};
const deleteSharedVineyard = async (userId: string, ownerId: string, vineyardId: string) => {
  try {
    console.log(`Deleting vineyard ${vineyardId} of ${ownerId} to shared vineyards of ${userId}`);
    await db.collection('users').doc(userId).collection('sharedVineyards').doc(vineyardId).delete();
  } catch (error) {
    console.error(`Could not delete ${vineyardId} of ${ownerId} to shared vineyards of ${userId}`, error);
    throw error;
  }
};
export const shareVineyard = async (ownerId: string, vineyardId: string, opts: SharingOpts): Promise<void> => {
  await addPermissions(ownerId, vineyardId, opts.user, opts.permissions);
  await addSharedVineyard(opts.user, ownerId, vineyardId);
};
export const unshareVineyard = async (ownerId: string, vineyardId: string, userId: string): Promise<void> => {
  await deletePermissions(ownerId, vineyardId, userId);
  await deleteSharedVineyard(userId, ownerId, vineyardId);
};
