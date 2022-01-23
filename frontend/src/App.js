import React, { Component } from "react";
import Modal from "./components/Modal";
import SignIn from "./components/SignIn"
import axios from "axios";
import ApiCalendar from "react-google-calendar-api";
import {Input, Form, FormGroup, FormText} from "reactstrap";

axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
axios.defaults.xsrfCookieName = "csrftoken";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectValue: 'None',
      viewCompleted: -1,
      todoList: [],
      modal: false,
      allTags: [],
      activeItem: {
        title: "",
        description: "",
        completed: false,
        tags: '',
      },
    };
    this.handleDropdownChange = this.handleDropdownChange.bind(this);
  }

  componentDidMount() {
    this.refreshList();
  }

  refreshList = () => {
    axios
      .get("/api/todos/")
      .then((res) => {
        var li = []
        for(var i = 0;  i<res.data.length; i++){
          li.push(res.data[i].tags.toLowerCase())
        }
        this.setState({ todoList: res.data, allTags: [... new Set(li)]})
      })
      .catch((err) => console.log(err));
  };

  toggle = () => {
    this.setState({ modal: !this.state.modal });
  };

  handleSubmit = (item) => {
    this.toggle();

    if (item.id) {
      axios
        .put(`/api/todos/${item.id}/`, item)
        .then((res) => this.refreshList());
      return;
    }
    axios
      .post("/api/todos/", item)
      .then((res) => this.refreshList());
  };

  handleDelete = (item) => {
    axios
      .delete(`/api/todos/${item.id}/`)
      .then((res) => this.refreshList());
  };

  createItem = () => {
    const item = { title: "", description: "", completed: false, tags: "" };

    this.setState({ activeItem: item, modal: !this.state.modal });
  };

  editItem = (item) => {
    this.setState({ activeItem: item, modal: !this.state.modal });
  };

  displayCompleted = (status) => {
    if (status === 1) { //completed
      return this.setState({ viewCompleted: 1 } );
    }
    if(status === 0){ //not completed
      return this.setState({ viewCompleted: 0 });
    }

    if(status === -1){ //all
      return this.setState({ viewCompleted: -1 });
    }
  };

  renderTabList = () => {
    return (
      <div className="nav nav-tabs">
        <span
          onClick={() => this.displayCompleted(-1)}
          className={this.state.viewCompleted  === -1 ? "nav-link active" : "nav-link"}
        >
          All
        </span>
        <span
          onClick={() => this.displayCompleted(1)}
          className={this.state.viewCompleted === 1 ? "nav-link active" : "nav-link"}
        >
          Complete
        </span>
        <span
          onClick={() => this.displayCompleted(0)}
          className={this.state.viewCompleted  === 0 ? "nav-link active" : "nav-link"}
        >
          Incomplete
        </span>
      </div>
    );
  };

  renderItems = () => {
    const { viewCompleted } = this.state;
    var newItems;

    if(viewCompleted === -1){
      newItems = this.state.todoList;
    }
    else{
      if(viewCompleted === 1){
        newItems = this.state.todoList.filter(
          (item) => item.completed === true
        );
      }
      else{
        newItems = this.state.todoList.filter(
          (item) => item.completed === false
        );
      }
    }

    if(this.state.selectValue === 'None'){
    }
    else{
      newItems = newItems.filter((item) => item.tags.toLowerCase() === this.state.selectValue);
    }


    return newItems.map((item) => (
      <li
        key={item.id}
        className="list-group-item d-flex justify-content-between align-items-center"
      >
        <span
          className={`todo-title mr-2 ${
            this.state.viewCompleted ? "completed-todo" : ""
          }`}
          title={item.description}
        >
          {item.title} 
          {/* https://medium.com/@seanmcp/%EF%B8%8F-how-to-use-emojis-in-react-d23bbf608bf7 Add the Check or Cross on the All page*/}
          {item.completed ===  true ? <span role="img" aria-label="White Heavy Check">✅</span> :<span role="img" aria-label="Cross Mark">❌</span>}  
        </span>
        <span>
          <button
            className="btn btn-secondary mr-2"
            onClick={() => this.editItem(item)}
          >
            Edit
          </button>
          <button
            className="btn btn-danger"
            onClick={() => this.handleDelete(item)}
          >
            Delete
          </button>
        </span>
      </li>
    ));
  };

  handleDropdownChange(e) {
    this.setState({ selectValue: e.target.value });
  }

  render() {
    return (
      <main className="container">
        <SignIn />
        <h1 className="text-white text-uppercase text-center my-4">Todo app</h1>
        <div className="row">
          <div className="col-md-6 col-sm-10 mx-auto p-0">
            <div className="card p-3">
              <div className="mb-4">
              </div>
              <div class="container">
                <div class="row">
                  <div class="col">
                    <button
                      className="btn btn-primary"
                      onClick={this.createItem}
                    >
                      Add task
                    </button>
                  </div>
                  <div class="col-sm">
                    <Form>
                        <FormGroup>
                          <Input type="select" name="select" id="exampleSelect" onChange={this.handleDropdownChange}>
                            <option value="None">None</option>
                            {this.state.allTags.map((tag)=>(
                              <option value={`${tag}`}>{tag}</option>
                            ))}
                          </Input>
                          <FormText color="muted">Sort by Tag</FormText>
                        </FormGroup>
                      </Form>
                  </div>
                </div>
              </div>
              {this.renderTabList()}
              <ul className="list-group list-group-flush border-top-0">
                {this.renderItems()}
              </ul>
            </div>
          </div>
        </div>
        {this.state.modal ? (
          <Modal
            activeItem={this.state.activeItem}
            toggle={this.toggle}
            onSave={this.handleSubmit}
          />
        ) : null}
      </main>
      
    );
  }
}

export default App;