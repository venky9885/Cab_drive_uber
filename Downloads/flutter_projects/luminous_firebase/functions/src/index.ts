import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
//import { notificationHandlerModule } from "./notificationHandler";
//import 'firebase-functions';
admin.initializeApp();
/*export const notificationHandler = functions.firestore.document("/insta_a_feed/{userId}/items/{activityFeedItem}")
   .onCreate(async (snapshot, context) => {
      await notificationHandlerModule(snapshot, context);
  });*/
export async function sendFCM(uid: string, payload: admin.messaging.DataMessagePayload) {

    const message: admin.messaging.MessagingPayload = {

        notification: {
            title: payload.title,
            body: payload.body,
            clickAction: 'FLUTTER_NOTIFICATION_CLICK',
        },
        data: payload,

    }

    console.log(message, uid);

    return admin.messaging().sendToTopic(uid, message);
};




export const fanOutPostWrite = functions.firestore
    .document('users/{uid}/posts/{postId}')
    .onWrite(async (change, context) => {
        const postId = context.params.postId;
        const uploader = context.params.uid;
        //const afterdata = change.after.data();
        //const data = snapshot.data();

        const followerRefs = await admin.firestore()  ///////firestore~66661
            .collection('users').doc(uploader)
            .collection('followers').get();

        let batchArray: FirebaseFirestore.WriteBatch[] = [];
        batchArray.push(admin.firestore().batch());    /////2
        let operationCounter = 0;
        let batchIndex = 0;

        followerRefs.docs.forEach((doc : any) => {
            const followerId = doc.id;      /////3

            const followingFeedRef = admin.firestore().collection('users').doc(followerId) ////6

                .collection('feed').doc(postId);


            //On Delete
            if (!change.after.exists && change.before.exists) {

                batchArray[batchIndex].delete(followingFeedRef);

            } else {
                const data = change.after.data();
                batchArray[batchIndex].set(followingFeedRef, data);
            }

            operationCounter++;

            if (operationCounter === 499) {
                batchArray.push(admin.firestore().batch());  ////4
                batchIndex++;
                operationCounter = 0;
            }
        });

        batchArray.forEach(batch => batch.commit());
        

        if (change.after.exists) {
            const myFeedRef = admin.firestore().collection('users').doc(uploader)  ////5
                .collection('feed').doc(postId);

            console.log('should update this post on my feed', myFeedRef.path);
            return myFeedRef.set({
                
        
               postId : change.after.data(),
            }, {merge: true}
               // change.after.data()
            );
        }

        return null;
    
});





export const updatePostLikeCount = functions.firestore

    .document('posts/{postId}/likes/{uid}')
    .onWrite((change, context) => {
    
        const postId = context.params.postId;
    
        let increment: number;
    
        const publicPostRef = admin.firestore().collection('posts').doc(postId); ///
    
        //onCreate
        if (change.after.exists && !change.before.exists) {
            increment = 1;
            //onDelete
        } else if (!change.after.exists && change.before.exists) {
            increment = -1;
        } else {
            return null;
        }
    
        return publicPostRef.set({
            'like_count': admin.firestore.FieldValue.increment(increment),
        }, { merge: true });
    
});
/////////////**********
export const fanOutStoryWrite = functions.firestore
    .document('users/{uid}/stories/{storyId}')
    .onWrite(async (change, context) => {
        const storyId = context.params.storyId;
        const uploader = context.params.uid;
        //const afterdata = change.after.data();
        //const data = snapshot.data();

        const followerRefs = await admin.firestore()  ///////firestore~66661
            .collection('users').doc(uploader)
            .collection('followers').get();

        let batchArray: FirebaseFirestore.WriteBatch[] = [];
        batchArray.push(admin.firestore().batch());    /////2
        let operationCounter = 0;
        let batchIndex = 0;

        followerRefs.docs.forEach((doc : any) => {
            const followerId = doc.id;      /////3

            const followingFeedRef = admin.firestore().collection('users').doc(followerId) ////6

                .collection('story_feed').doc(storyId);


            //On Delete
            if (!change.after.exists && change.before.exists) {

                batchArray[batchIndex].delete(followingFeedRef);

            } else {
                const data = change.after.data();
                batchArray[batchIndex].set(followingFeedRef, data);
            }

            operationCounter++;

            if (operationCounter === 499) {
                batchArray.push(admin.firestore().batch());  ////4
                batchIndex++;
                operationCounter = 0;
            }
        });

        batchArray.forEach(batch => batch.commit());
        

        if (change.after.exists) {
            const myFeedRef = admin.firestore().collection('users').doc(uploader)  ////5
                .collection('story_feed').doc(storyId);

            console.log('should update this post on my feed', myFeedRef.path);
            return myFeedRef.set({
                
        
               storyId : change.after.data(),
            }, {merge: true}
               // change.after.data()
            );
        }

        return null;
    
});
/*
export const documentWriteListener = 
    functions.firestore.document('users/{uid}/followers/{Uid')
    .onWrite((change, context) => {
        const uid = context.params.uid;
       //const  docRef = admin.firestore().collection('users').doc({uid});
    if (!change.before.exists) {
        // New document Created : add one to count

        admin.firestore().collection('users').doc(uid).update({follower_count: admin.firestore.FieldValue.increment(1)});

    } else if (change.before.exists && change.after.exists) {
        // Updating existing document : Do nothing

    } else if (!change.after.exists) {
        // Deleting document : subtract one from count
        admin.firestore().collection('users').doc(uid).update({follower_count: admin.firestore.FieldValue.increment(-1)})
        //admin.firestore().doc(docRef).update({numberOfDocs: admin.firestore.FieldValue.increment(1)});
        //admin.firestore().doc(docRef).update({numberOfDocs: FieldValue.increment(-1)});

    }

return;
});*/

export const updatefollowingsCount = functions.firestore
//userRef.update({ FieldToIncrease: increment });
    .document('users/{uid}/followers/{uId}')
    .onWrite((change, context) => {
    
        const uId = context.params.uId;
    
        let increment: number;
    
        const publicPostRef = admin.firestore().collection('users').doc(uId); ///
        //const publicPostRef = admin.firestore().collection('users').doc(uId).collection('followers').doc('uId');
        //onCreate
        if (change.after.exists && !change.before.exists) {
            increment = 1;
            //onDelete
        } else if (!change.after.exists && change.before.exists) {
            increment = -1;
        } else {
            return null;
        }
    
        return publicPostRef.set({
            'following_count': admin.firestore.FieldValue.increment(increment),
        }, { merge: true });
    
});
////////---
export const updatefollowersCount = functions.firestore
//userRef.update({ FieldToIncrease: increment });
    .document('users/{uid}/followings/{uId}')
    .onWrite((change, context) => {
    
        const uId = context.params.uId;
    
        let increment: number;
    
        const publicPostsRef = admin.firestore().collection('users').doc(uId); ///
        //const publicPostRef = admin.firestore().collection('users').doc(uId).collection('followers').doc('uId');
        //onCreate
        if (change.after.exists && !change.before.exists) {
            increment = 1;
            //onDelete
        } else if (!change.after.exists && change.before.exists) {
            increment = -1;
        } else {
            return null;
        }
    
        return publicPostsRef.set({
            'follower_count': admin.firestore.FieldValue.increment(increment),
        }, { merge: true });
    
});
////////---
export const updatepostCount = functions.firestore
    .document('users/{uid}/posts/{ud}')
    .onWrite((change, context) => {
    
        const uid = context.params.uid;
    
        let increment: number;
    
        const publicPosRef = admin.firestore().collection('users').doc(uid); ///
        //const publicPostRef = admin.firestore().collection('users').doc(uId).collection('followers').doc('uId');
        //onCreate
        if (change.after.exists && !change.before.exists) {
            increment = 1;
            //onDelete
        } else if (!change.after.exists && change.before.exists) {
            increment = -1;
        } else {
            return null;
        }
    
        return publicPosRef.set({
            'post_count': admin.firestore.FieldValue.increment(increment),
        }, { merge: true });
    
});

///////////---------
export const fanOutVidPostWrite = functions.firestore
    .document('users/{uid}/vidposts/{postId}')
    .onWrite(async (change, context) => {
        const postId = context.params.postId;
        const uploader = context.params.uid;
        //const afterdata = change.after.data();
        //const data = snapshot.data();

        const followerRefs = await admin.firestore()  ///////firestore~66661
            .collection('users').doc(uploader)
            .collection('followers').get();

        let batchArray: FirebaseFirestore.WriteBatch[] = [];
        batchArray.push(admin.firestore().batch());    /////2
        let operationCounter = 0;
        let batchIndex = 0;

        followerRefs.docs.forEach((doc : any) => {
            const followerId = doc.id;      /////3

            const followingFeedRef = admin.firestore().collection('users').doc(followerId) ////6

                .collection('vidfeed').doc(postId);


            //On Delete
            if (!change.after.exists && change.before.exists) {

                batchArray[batchIndex].delete(followingFeedRef);

            } else {
                const data = change.after.data();
                batchArray[batchIndex].set(followingFeedRef, data);
            }

            operationCounter++;

            if (operationCounter === 499) {
                batchArray.push(admin.firestore().batch());  ////4
                batchIndex++;
                operationCounter = 0;
            }
        });

        batchArray.forEach(batch => batch.commit());
        

        if (change.after.exists) {
            const myFeedRef = admin.firestore().collection('users').doc(uploader)  ////5
                .collection('feed').doc(postId);

            console.log('should update this post on my feed', myFeedRef.path);
            return myFeedRef.set({
                
        
               postId : change.after.data(),
            }, {merge: true}
               // change.after.data()
            );
        }

        return null;
    
});

//////////------

/*export const notificationHandler = functions.firestore.document("/insta_a_feed/{userId}/items/{activityFeedItem}")
   .onCreate(async (snapshot, context) => {
      await notificationHandlerModule(snapshot, context);
  });*/