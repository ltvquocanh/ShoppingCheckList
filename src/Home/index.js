import React from 'react'
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import Amplify from 'aws-amplify';
import awsconfig from '../aws-exports';
import DatePicker from "react-datepicker";
import { FormSelect, Table, Spinner } from 'react-bootstrap';
import { fetchUsers, fetchShopItems, getUserSession, updateUserItemStatus } from '../Helper/UserHelper';
import { endcodeUserName, decodeUserName } from '../Helper/Utils'

Amplify.configure(awsconfig);
const COMPLETE_STATUS = 1

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = { users: '', loggedUser: null, shoppingList: [], shoppingDate: new Date(), userId: 'All', enableSpinder: true };
        this.handleSelectUser = this.handleSelectUser.bind(this)
        this.handleDatePickerChange = this.handleDatePickerChange.bind(this)
        this.handleChangeStatus = this.handleChangeStatus.bind(this)
    }

    handleSelectUser(e) {
        const id = e.target.value;
        this.setState({ ...this.state, userId: id, enableSpinder: true })
        const date = this.state.shoppingDate;
        date.setHours(0, 0, 0, 0)
        fetchShopItems(id, date.toISOString()).then((result) => {
            this.setState({ ...this.state, shoppingList: result.data.listShoppingItems.items, enableSpinder: false })
        })
    }

    handleDatePickerChange(date) {
        this.setState({ ...this.state, shoppingDate: date, enableSpinder: true })
        date.setHours(0, 0, 0, 0)
        fetchShopItems(this.state.userId, date.toISOString()).then((result) => {
            this.setState({ ...this.state, shoppingList: result.data.listShoppingItems.items, enableSpinder: false })
        })
    }

    handleChangeStatus(item) {
        if (!item) return

        updateUserItemStatus(item.id, COMPLETE_STATUS).then((result) => {

            const data = this.state.shoppingList.map((i) => {
                if (i.id !== result.data.updateShoppingItem.id) {
                    return i
                } else {
                    i.status = COMPLETE_STATUS;
                    return i
                }
            })
            this.setState({ ...this.state, shoppingList: data })
        })
    }

    componentDidMount() {
        getUserSession().then((result) => {
            this.setState({ ...this.state, loggedUser: result, userId: endcodeUserName(result.username) })
            const date = this.state.shoppingDate
            date.setHours(0, 0, 0, 0)
            fetchShopItems('All', date.toISOString()).then((result) => {
                this.setState({ ...this.state, shoppingList: result.data.listShoppingItems.items, enableSpinder: false })
            })
        });
        fetchUsers().then((result) => {
            this.setState({ ...this.state, users: result.Users })
        })
    }

    render() {
        let encodeUser = (this.state.loggedUser?.username) ? endcodeUserName(this.state.loggedUser?.username) : ""
        return (
            <div>
                <h2>Welcome:  {this.state.loggedUser?.username} </h2>
                <div>
                    <div style={styles.selectGroup}>
                        <label style={styles.label}>Select User:</label>
                        <FormSelect onChange={(e) => this.handleSelectUser(e)}>
                            <option value="All">All</option>
                            {this.state.users && this.state.users.map((user, index) => (
                                <option key={user.id ? user.id : index} value={endcodeUserName(user.Username)}>{user.Username}</option>
                            ))}

                        </FormSelect>
                    </div>
                    <div style={styles.selectGroup}>
                        <label style={styles.label}>Shopping Date</label>
                        <DatePicker dateFormat="yyyy-MM-d" selected={this.state.shoppingDate} onChange={(date) => this.handleDatePickerChange(date)} />
                    </div>
                    <br />
                    {this.state.enableSpinder ?
                        <div style={styles.spinder}><Spinner animation="border" variant="info" /></div>
                        :
                        <Table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Item Name</th>
                                    <th>Description</th>
                                    <th>Shop Name</th>
                                    <th>Assigned User</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    this.state.shoppingList && this.state.shoppingList.map((item, index) => (
                                        <tr key={item.id ? item.id : index}>
                                            <td>{index + 1}</td>
                                            <td>{item.name}</td>
                                            <td>{item.description}</td>
                                            <td>{item.shop_name}</td>
                                            <td>{decodeUserName(item.user_id)}</td>
                                            <td>
                                                {(encodeUser === item.user_id && item.status !== COMPLETE_STATUS) ?
                                                    <button onClick={() => this.handleChangeStatus(item)}>Mark complete</button>
                                                    : item.status !== COMPLETE_STATUS ? <span>Incomplete</span> : <span>Completed</span>
                                                }
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </Table>
                    }
                </div>
                <div style={styles.signOutGroup}>
                    <AmplifySignOut />
                </div>

            </div>
        )
    }
}

export default withAuthenticator(Home, true);

const styles = {
    selectGroup: { display: 'flex', flexDirection: 'row', marginTop: 15 },
    label: { width: 200 },
    signOutGroup: { width: 200 },
    spinder: { textAlign: 'center' }

}