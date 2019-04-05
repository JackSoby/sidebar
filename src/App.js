import React, { Component } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
// import { _ } from 'lodash'
class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      parentCategories: [],
      subCategories: [],
      selectedId: null,
      selectedSubCategoryId: null,
      productId: null,
      configurations: [],
      priceRules: []
    }

    this.getSubCategories = this.getSubCategories.bind(this)
    this.slugify_name = this.slugify_name.bind(this)
    this.selectNewSubCategory = this.selectNewSubCategory.bind(this)
    this.getProductConfigurations = this.getProductConfigurations.bind(this)
  }

  componentDidMount() {
    fetch(`https://beswick-product-manager-dev.bowst.com/api/categories`,
      {
        method: 'GET', redirect: 'follow',
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" }
      })
      .then(response => response.json())
      .then(body => {
        this.setState({ parentCategories: body.data })
      })
  }

  getSubCategories(event) {

    let parentId = event.target.id
    fetch(`https://beswick-product-manager-dev.bowst.com/api/categories/by-category-code?code=${this.slugify_name(event.target.getAttribute('name'))}`,
      {
        method: 'GET', redirect: 'follow',
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" }
      })
      .then(response => response.json())
      .then(body => {
        this.setState({
          subCategories: body.data,
          selectedId: parentId,
          configurations: [],
          priceRules: [],
          selectedSubCategoryId: null
        })
      })
  }

  selectNewSubCategory(event) {
    let id = event.target.id
    this.setState({
      selectedSubCategoryId: id
    })
  }

  slugify_name(name) {
    return name.toLowerCase().replace(/,/g, "").split(" ").join("-");
  }

  getProductConfigurations(event) {
    let productId = event.target.id
    fetch(`https://beswick-product-manager-dev.bowst.com/api/configurations/by-product-id?id=${productId}`,
      {
        method: 'GET', redirect: 'follow',
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" }
      })
      .then(response => response.json())
      .then(body => {
        console.log(body)
        this.setState({
          configurations: body.configurations,
          priceRules: body.priceRules,
          productId: productId
        })
      })
  }


  render() {
    let cats = this.state.parentCategories.map(cat => {

      if (this.state.selectedId == cat.id) {

        let subCats = this.state.subCategories.map(cat => {

          if (this.state.selectedSubCategoryId == cat.id) {

            let prods = cat.products.map(prod => {
              if (this.state.productId == prod.id) {
                let configurations = {}


                let configs = this.state.configurations.map(config => {
                  configurations[`${config.key}`] = config.name
                  return (
                    <div key={config.id} id={config.id}>
                      {config.name}
                    </div>
                  )
                })
                let priceConditions = this.state.priceRules.map(rule => {
                  let conditions = []
                  rule.priceConditions.map(con => {
                    conditions.push(configurations[`${con.key}`])

                  })
                  return (
                    <div >
                      {conditions.join(", ")}
                    </div>
                  )
                })

                return (
                  <div key={prod.id} id={prod.id}>
                    {prod.name}
                    <div className="alert alert-danger">
                      <div>
                        <h3>Configurations</h3>
                        {configs}
                        <h3>Rules</h3>
                        {priceConditions}
                      </div>
                    </div>
                  </div>
                )
              } else {
                return (
                  <div onClick={this.getProductConfigurations} key={prod.id} id={prod.id}>
                    {prod.name}
                  </div>
                )
              }
            })
            return (
              <div key={cat.id} id={cat.id}>
                {cat.name}
                <div className="alert alert-warning">
                  <div>
                    {prods}
                  </div>
                </div>
              </div>
            )

          } else {

            return (
              <div key={cat.id} onClick={this.selectNewSubCategory} id={cat.id}>
                {cat.name}
              </div>
            )
          }
        })

        return (
          <div key={cat.id} id={cat.id} name={cat.name} className="alert alert-info">
            {cat.name}
            <div className="alert alert-success">
              {subCats}
            </div>
          </div>
        );

      } else {

        return (
          <div onClick={this.getSubCategories} key={cat.id} id={cat.id} name={cat.name} className="alert alert-info">
            {cat.name}
          </div>
        );
      }
    })

    return (
      <div className="" >
        {cats}
      </div>
    )

  }
}

export default App;

