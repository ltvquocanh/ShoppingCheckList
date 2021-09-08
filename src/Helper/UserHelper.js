import Amplify, { Auth, API, graphqlOperation } from 'aws-amplify';
import awsconfig from '../aws-exports';
import { listShoppingItems } from '../graphql/queries'
import {updateShoppingItem} from '../graphql/mutations'
import AWS from 'aws-sdk';

Amplify.configure(awsconfig);

export async function fetchUsers() {
    var params = {
        UserPoolId: 'us-east-1_veGfj2qjb',
        AttributesToGet: [
            'email'
        ],
    };

    return new Promise((resolve, reject) => {
        AWS.config.update({ region: awsconfig.aws_cognito_region, 'accessKeyId': 'AKIAQVQQANQEDXBRR64Q', 'secretAccessKey': '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' });
        var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
        cognitoidentityserviceprovider.listUsers(params, (err, data) => {
            if (err) {
                console.log(err);
                reject([]);
            }
            else {
                resolve(data);
            }
        })
    });
}

export async function fetchShopItems(userId = 'All', filterDate = null) {
    let filter = {
        and: []
    }
    if (userId !== 'All') {
        filter.and.push({ user_id: { eq: userId } })
    }

    if (filterDate) {
        filter.and.push({ shopping_date: { eq: filterDate } })
    }

    const result = await API.graphql(graphqlOperation(listShoppingItems, { filter: filter }))
    return result
}

export async function getUserSession() {
    const user = await Auth.currentUserInfo()
    return user;
}


export async function updateUserItemStatus(itemId, status) {
    if(!itemId) return
    const result = await API.graphql(graphqlOperation(updateShoppingItem, { input: {status: status, id: itemId}}))
    return result;
}