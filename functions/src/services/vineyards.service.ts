import { SharedVineyardOpts, SharingOpts, SharingPermission } from '../models/sharing.model';
import { db } from './utils.service';
import { SharedVineyard, SharedVineyardPermission, VineyardPermissions } from '../models/vineyard.model';
import { getUserEmail, getUserIdFromEmail, getUsername } from './user.service';

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

export const isOwner = async (ownerId: string, vineyardId: string): Promise<boolean> => {
  try {
    console.log(`Check if ${ownerId} is the owner of ${vineyardId}`);
    const doc = await db.collection('users').doc(ownerId).collection('vineyards').doc(vineyardId).get();
    return doc.exists;
  } catch (error) {
    console.error(`Could not check if ${ownerId} is owner of ${vineyardId}`, error);
    return false;
  }
};

export const getSharedVineyards = async (userId: string): Promise<SharedVineyard[]> => {
  try {
    console.log(`Retrieving shared vineyards for ${userId}`);
    const ids = await db.collection('users').doc(userId).collection('sharedVineyards').listDocuments();
    return await Promise.all(
      ids.map((doc) =>
        doc
          .get()
          .then((data) => data.data() as SharedVineyardOpts)
          .then((info: SharedVineyardOpts) =>
            Promise.all([
              db.collection('users').doc(info.user).collection('vineyards').doc(info.vineyard).get(),
              getUsername(info.user),
              db
                .collection('users')
                .doc(info.user)
                .collection('vineyards')
                .doc(info.vineyard)
                .collection('permissions')
                .doc(userId)
                .get()
                .then(
                  (snapshot) =>
                    (snapshot.exists && snapshot.data()
                      ? (snapshot.data()?.permissions as VineyardPermissions)
                      : undefined) || VineyardPermissions.NONE
                ),
              info,
            ])
          )
          .then(([snapshot, username, permissions, info]) =>
            snapshot.exists
              ? ({
                  ...snapshot.data(),
                  id: info.vineyard,
                  owner: info.user,
                  ownerName: username,
                  permissions,
                  shared: true,
                } as SharedVineyard)
              : undefined
          )
      )
    ).then(
      (vineyards) => vineyards.filter((v) => !!v && v.permissions >= VineyardPermissions.VIEW) as SharedVineyard[]
    );
  } catch (error) {
    console.error(`Could not retrieve shared vineyards for ${userId}`, error);
    throw error;
  }
};

export const shareVineyard = async (ownerId: string, vineyardId: string, opts: SharingOpts): Promise<void> => {
  const user = await getUserIdFromEmail(opts.user);
  if (user) {
    await addPermissions(ownerId, vineyardId, user, opts.permissions);
    await addSharedVineyard(user, ownerId, vineyardId);
  } else {
    throw Error(`Could not find user ${opts.user}`);
  }
};
export const unshareVineyard = async (ownerId: string, vineyardId: string, userId: string): Promise<void> => {
  await deletePermissions(ownerId, vineyardId, userId);
  await deleteSharedVineyard(userId, ownerId, vineyardId);
};

export const getVineyardPermissions = async (
  ownerId: string,
  vineyardId: string
): Promise<SharedVineyardPermission[]> => {
  try {
    console.log(`Getting shared users for vineyard ${vineyardId} of ${ownerId}`);
    const users = await db
      .collection('users')
      .doc(ownerId)
      .collection('vineyards')
      .doc(vineyardId)
      .collection('permissions')
      .listDocuments();
    const permissions = await Promise.all(
      users.map(async (user) => {
        const doc = await user.get();
        const username = await getUsername(doc.id);
        const email = await getUserEmail(doc.id);
        return {
          ...doc.data(),
          username,
          user: doc.id,
          email,
        } as SharedVineyardPermission;
      })
    );
    return [
      {
        user: ownerId,
        username: (await getUsername(ownerId)) || 'User',
        email: await getUserEmail(ownerId),
        permissions: VineyardPermissions.OWNER,
      },
      ...permissions,
    ];
  } catch (error) {
    console.error(`Could not remove permissions from ${vineyardId} of ${ownerId}`, error);
    throw error;
  }
};
