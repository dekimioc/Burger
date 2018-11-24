import React, { Component } from 'react';
import { connect } from 'react-redux';

import Auxiliary from '../../hoc/Auxiliary/Auxiliary';
import Burger from '../../components/Burger/Burger';
import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';
import axios from '../../axios-orders';
import Spinner from '../../components/UI/Spinner/Spinner';
import withErrorHandler from '../../hoc/withErrorHandler/withErrorHandler';
import * as actions from '../../store/actions/index';



class BurgerBuilder extends Component {
    // constructor(props) {
    //     super(props);
    //     this.state = {

    //     };
    // }
    state = {
       // ingredients: null,
       // totalPrice: 4,
       // purchasable: false,
        purchasing: false,
        // loading: false,
        // error: false
    };

    componentDidMount() {
        this.props.onInitIngredients()
    };

    updateStatePurchasable (ingredients) {
        const sum = Object.keys(ingredients)
            .map(igKey => {
                return ingredients[igKey];
            }).reduce((sum, el) => {
                return sum + el;
            }, 0);
            return sum > 0;
    };

    purchasingHandler = () => {
        if(this.props.isAuth) {
            this.setState({purchasing: true})
        } else {
            this.props.onSetAuthenticationRedirectPath('/checkout');
            this.props.history.push('/authentication');
        }
        
    };

    purchaseCancelHandler = () => {
        this.setState({purchasing: false})
    };

    purchaseContinueHandler = () => {
        this.props.onInitPurchase();
        this.props.history.push('/checkout');
    };

    render() {
        const disabledInfo = {
            ...this.props.ing
        }
        for (let key in disabledInfo) {
            disabledInfo[key] = disabledInfo[key] <= 0;
        }

        
        let orderSummary = null;
        let burger = this.props.error ? <p>Ingredients can't be loaded!</p> : <Spinner />;

        if(this.props.ing) {
            burger = (
                <Auxiliary>
                    <Burger ingredients={this.props.ing} />
                    <BuildControls 
                        ingredientsAdded = {this.props.onIngredientAdded}
                        ingredientsRemoved = {this.props.onIngredientRemoved}
                        disabled={disabledInfo}
                        price={this.props.price}
                        purchasing={this.state.purchasing}
                        isAuthenticated={this.props.isAuth}
                        ordered={this.purchasingHandler}
                        purchasable={this.updateStatePurchasable(this.props.ing)}/>
                </Auxiliary>
                );
                orderSummary = <OrderSummary 
                ingredients={this.props.ing}
                purchaseCanceled={this.purchaseCancelHandler}
                purchaseContinued={this.purchaseContinueHandler}
                price={this.props.price}/>;
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

const mapStateToProps = state => {
    return {
        ing: state.burgerBuilder.ingredients,
        price: state.burgerBuilder.totalPrice,
        error: state.burgerBuilder.error,
        isAuth: state.authentication.token !== null
    }
    
};

const mapDispatchToProps = dispatch => {
    return {
        onIngredientAdded: (ingName) => dispatch (actions.addIngredient(ingName)),
        onIngredientRemoved: (ingName) => dispatch (actions.removeIngredient(ingName)),
        onInitIngredients: () => dispatch(actions.initIngredients()),
        onInitPurchase: () => dispatch(actions.purchaseInit()),
        onSetAuthenticationRedirectPath: (path) => dispatch(actions.setAuthenticationRedirectPath(path))
    }
    
}

export default connect(mapStateToProps, mapDispatchToProps)(withErrorHandler(BurgerBuilder, axios));