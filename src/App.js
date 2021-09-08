import React from 'react'
import Amplify from 'aws-amplify'
import awsExports from "./aws-exports";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";
import Home from "./Home";
import ShoppingList from './ShoppingList'
import {Container} from "react-bootstrap";

Amplify.configure(awsExports);
const App = () => {

  return (
    <Router>
      <Container fluid>
      <div style={styles.container}>
        <nav>
        <ul style={styles.ul}> 
            <li style={styles.li}>
              <Link to="/">Home</Link>
            </li>
            <li style={styles.li}>
              <Link to="/shopitems">Shopping Items</Link>
            </li>
          </ul>
        </nav>
        <Switch>
          <Route  exact path="/shopitems">
            <ShoppingList />
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
        
      </div>
      </Container>
    </Router>
  )
}

const styles = {
  container: { width: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 20 },
  ul: {listStyle: 'none', marginBottom: 30, padding: '20px 0', display: 'inline-block'},
  li: {float: 'left', paddingRight: 30},
  todo: { marginBottom: 15 },
  input: { border: 'none', backgroundColor: '#ddd', marginBottom: 10, padding: 8, fontSize: 18 },
  todoName: { fontSize: 20, fontWeight: 'bold' },
  todoDescription: { marginBottom: 0 },
  button: { backgroundColor: 'black', color: 'white', outline: 'none', fontSize: 18, padding: '12px 0px' }
}

export default App;