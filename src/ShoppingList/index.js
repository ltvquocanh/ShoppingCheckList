import React, { useEffect, useState } from 'react'
import Amplify, { API, graphqlOperation } from 'aws-amplify';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import awsconfig from '../aws-exports';
import { createShoppingItem, deleteShoppingItem, updateShoppingItem } from '../graphql/mutations';
import { listShoppingItems } from '../graphql/queries';
import { Table, Button, Form } from 'react-bootstrap';
import { Label } from 'aws-amplify-react';
import DatePicker from "react-datepicker";
import AWS from 'aws-sdk';
import awsConfig from '../awsconfiguration';

import { endcodeUserName, decodeUserName, parseDateTostring } from '../Helper/Utils'

Amplify.configure(awsconfig);

const initialState = { name: '', user_id: 0, shopping_date: new Date(), description: '', shop_name: '', status: 0, id: null }

const ShoppingList = () => {
    const [formState, setFormState] = useState(initialState)
    const [users, setUsers] = useState([]);
    const [items, setItems] = useState([])

    useEffect(() => {
        fetchItems()
        fetchUsers()
    }, [])

    function setInput(key, value) {
        setFormState({ ...formState, [key]: value })
    }

    function editShopItem(item) {
        setFormState({
            id: item.id,
            name: item.name,
            user_id: item.user_id,
            shopping_date: new Date(item.shopping_date),
            description: item.description,
            shop_name: item.shop_name
        })
    }

    async function fetchUsers() {
        var params = {
            UserPoolId: 'us-east-1_veGfj2qjb',
            AttributesToGet: [
                'email'
            ],
        };

        return new Promise((resolve, reject) => {
            AWS.config.update({ region: awsconfig.aws_cognito_region, 'accessKeyId': awsConfig.accessKeyId, 'secretAccessKey': awsConfig.secretAccessKey });
            var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
            cognitoidentityserviceprovider.listUsers(params, (err, data) => {
                if (err) {
                    console.log(err);
                    reject([]);
                }
                else {
                    setUsers(data.Users);
                    resolve(data);
                }
            })
        });
    }

    async function fetchItems() {
        try {
            const shoppingItems = await API.graphql(graphqlOperation(listShoppingItems))
            const items = shoppingItems.data.listShoppingItems.items

            setItems(items)
        } catch (err) { console.log('error fetching shop item') }
    }

    async function addItem() {
        try {
            if (!formState.name || !formState.user_id) return
            const item = { ...formState }
            const shoppingDate = item.shopping_date
            shoppingDate.setHours(0, 0, 0, 0)
            item.shopping_date = shoppingDate.toISOString();

            setFormState(initialState)
            if (item.id) {
                const ulist = items.filter(u => u.id !== item.id)
                setItems([...ulist, item,])
                await API.graphql(graphqlOperation(updateShoppingItem, { input: item }))

            } else {
                const result = await API.graphql(graphqlOperation(createShoppingItem, { input: item }))
                setItems([...items, result.data.createShoppingItem])
                //console.log(result)
            }

        } catch (err) {
            console.log('error creating Shop item:', err)
        }
    }

    async function deleteItem(id) {
        try {
            if (!id) return
            const arr = items.filter((item) => item.id !== id);
            setItems(arr);
            await API.graphql(graphqlOperation(deleteShoppingItem, { input: { id: id } }))
        }
        catch (err) {
            console.log('Cannot delete Item:', err)
        }
    }

    return (
        <div className="wrapper" style={styles.container}>
            <h2> Create Shopping Item</h2>
            <div style={styles.form}>
                <div style={styles.inputGroup}>
                    <Label>Assign User</Label>
                    <Form.Select size="lg" value={formState.user_id} onChange={(e) => { setFormState({ ...formState, user_id: e.target.value }) }}>
                        <option value="0">Select User</option>
                        {
                            users.map((item, index) => (
                                <option key={item.id ? item.id : index} value={endcodeUserName(item.Username)}>{item.Username}</option>
                            ))
                        }

                    </Form.Select>
                </div>
                <div style={styles.inputGroup}>
                    <Label>Shopping Date</Label>
                    <DatePicker dateFormat="yyyy-MM-d" selected={formState.shopping_date} onChange={(date) => { setFormState({ ...formState, shopping_date: date }) }} />
                </div>
                <div style={styles.inputGroup}>
                    <Label>Item Name</Label>
                    <Form.Control type="text"
                        onChange={event => setInput('name', event.target.value)}
                        value={formState.name}
                    />
                </div>
                <div style={styles.inputGroup}>
                    <Label>Shop Name</Label>
                    <Form.Control type="text"
                        onChange={event => setInput('shop_name', event.target.value)}
                        value={formState.shop_name}
                    />
                </div>
                <div style={styles.inputGroup}>
                    <Label>Description</Label>
                    <Form.Control as="textarea"
                        onChange={event => setInput('description', event.target.value)}
                        value={formState.description}
                    />
                </div>

            </div>

            <Button style={styles.btnSave} variant="primary" onClick={addItem}> Save</Button>
            <br />
            <Table striped bordered hover>
                <caption> Shopping Items  </caption>
                <thead>
                    <tr>
                        <th> Name</th>
                        <th> Description</th>
                        <th> Shop Name</th>
                        <th>Assigned user</th>
                        <th>Shopping_date</th>
                        <th> Action</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        items.map((item, index) => (
                            <tr key={item.id ? item.id : index}>
                                <td>{item.name}</td>
                                <td>{item.description}</td>
                                <td>{item.shop_name}</td>
                                <td>{decodeUserName(item.user_id)}</td>
                                <td>{parseDateTostring(item.shopping_date)}</td>
                                <td> <Button variant="warning" onClick={() => deleteItem(item.id)}>Delete</Button> <span onClick={() => editShopItem(item)} >Edit</span></td>
                            </tr>
                        ))
                    }
                </tbody>
            </Table>
            <AmplifySignOut />
        </div>
    );
}

export default withAuthenticator(ShoppingList, true);

const styles = {
    container: { display: 'flex', width: '100%', flexDirection: 'column' },
    form: { display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: '15px', columnGap: 15, marginBottom: 30 },
    inputGroup: { width: '100%' },
    createForm: { display: 'flex', flexDirection: 'column', marginBottom: 30 },
    itemName: { fontSize: 20, fontWeight: 'bold' },
    itemDescription: { marginBottom: 0 },
    btnSave: { width: 130 }
};