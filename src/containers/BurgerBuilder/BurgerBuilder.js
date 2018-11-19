import React, { Component } from 'react';

import Auxiliary from '../../hoc/Auxiliary/Auxiliary';
import Burger from '../../components/Burger/Burger';
import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';
import axios from '../../axios-orders';
import Spinner from '../../components/UI/Spinner/Spinner';
import withErrorHandler from '../../hoc/withErrorHandler/withErrorHandler';

const INGREDIENTS_PRICE = {
    salad: 0.5,
    bacon: 0.7,
    cheese: 0.6,
    meat: 0.9
}

class BurgerBuilder extends Component {
    // constructor(props) {
    //     super(props);
    //     this.state = {

    //     };
    // }
    state = {
        ingredients: null,
        totalPrice: 4,
        purchasable: false,
        purchasing: false,
        loading: false,
        error: false
    }

    componentDidMount() {
        // axios.get('https://my-burger-app-react-de643.firebaseio.com/ingredients.json')
        //     .then(response => {
        //         this.setState({ingredients: response.data})
        //     }).catch(error => {
        //         this.setState({error: true})
        //     });
    }

    updateStatePurchasable (ingredients) {
        const sum = Object.keys(ingredients)
            .map(igKey => {
                return ingredients[igKey];
            }).reduce((sum, el) => {
                return sum + el;
            }, 0);
            this.setState({purchasable: sum > 0})
    }

    addIngredientHandler = (type) => {
        const oldCount = this.state.ingredients[type];
        const updatedCount = oldCount + 1;
        const updatedIngredients = {
            ...this.state.ingredients
        }
        updatedIngredients[type] = updatedCount;
        const priceAdition = INGREDIENTS_PRICE[type];
        const oldPrice = this.state.totalPrice;
        const newPrice = oldPrice + priceAdition;
        this.setState({
            ingredients: updatedIngredients,
            totalPrice: newPrice
        })
        this.updateStatePurchasable(updatedIngredients);
    }

    removeIngredientHandler = (type) => {
        const oldCount = this.state.ingredients[type];

        // if (oldCount <= 0) {
        //     return;
        // }

        const updatedCount = oldCount - 1;
        const updatedIngredients = {
            ...this.state.ingredients
        }
        updatedIngredients[type] = updatedCount;
        const priceDeduction = INGREDIENTS_PRICE[type];
        const oldPrice = this.state.totalPrice;
        const newPrice = oldPrice - priceDeduction;
        this.setState({
            ingredients: updatedIngredients,
            totalPrice: newPrice
        })
        this.updateStatePurchasable(updatedIngredients);
    }

    purchasingHandler = () => {
        this.setState({purchasing: true})
    }

    purchaseCancelHandler = () => {
        this.setState({purchasing: false})
    }

    purchaseContinueHandler = () => {
       // alert("You continue");
    
    const queryParams = [];
    for (let i in this.state.ingredients) {
        queryParams.push(encodeURIComponent(i) + "=" + encodeURIComponent(this.state.ingredients[i]));
    }
    queryParams.push("price=" + this.state.totalPrice);
    const queryString = queryParams.join("&");
    this.props.history.push({
        pathname: "/checkout",
        search: "?" + queryString
    });
    }

    render() {
        const disabledInfo = {
            ...this.state.ingredients
        }
        for (let key in disabledInfo) {
            disabledInfo[key] = disabledInfo[key] <= 0;
        }

        
        let orderSummary = null;
        let burger = this.state.error ? <p>Ingredients can't be loaded!</p> : <Spinner />;

        if(this.state.ingredients) {
            burger = (
                <Auxiliary>
                    <Burger ingredients={this.state.ingredients} />
                    <BuildControls 
                        ingredientsAdded = {this.addIngredientHandler}
                        ingredientsRemoved = {this.removeIngredientHandler}
                        disabled={disabledInfo}
                        price={this.state.totalPrice}
                        purchasing={this.state.purchasing}
                        ordered={this.purchasingHandler}
                        purchasable={this.state.purchasable}/>
                </Auxiliary>
                );
                orderSummary = <OrderSummary 
                ingredients={this.state.ingredients}
                purchaseCanceled={this.purchaseCancelHandler}
                purchaseContinued={this.purchaseContinueHandler}
                price={this.state.totalPrice}/>;
            }

            if(this.state.loading) {
                orderSummary = <Spinner />
            }

        return (
            <Auxiliary>
                <Modal show={this.state.purchasing} modalClosed={this.purchaseCancelHandler}>
                    {orderSummary}
                </Modal>
                {burger}
            </Auxiliary>
        )
    }
}

export default withErrorHandler(BurgerBuilder, axios);