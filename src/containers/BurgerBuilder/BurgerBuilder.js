import React, { Component } from 'react';
import Aux from '../../hoc/Aux';
import Burger from '../../components/Burger/Burger';
import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';
import Spinner from '../../components/UI/Spinner/Spinner';
import axios from '../../axios-orders';

const INGREDIENT_PRICES = {
    salad: 0.5,
    cheese: 0.4,
    meat: 1.3,
    bacon: 0.7
}

class BurgerBuilder extends Component {
    state = {
        ingredients: {
            salad: 0,
            bacon: 0,
            cheese: 0,
            meat: 0
        },
        totalPrice: 4,
        purchasable: false,
        purchasing: false,
        loading: false
    };

    updatePurchaseState(ingredients) {
        const sum = Object.keys(ingredients)
            .map(igKey => {
                return ingredients[igKey]
            })
            .reduce((sum, el) => {
                return sum + el;
            }, 0);
        this.setState({purchasable: sum > 0});
    }

    addIngredientHandler = (type) => {
        const oldCount = this.state.ingredients[type];
        const updatedIngredients = {
            ...this.state.ingredients
        };
        updatedIngredients[type] = oldCount + 1;

        this.setState({
            ingredients: updatedIngredients,
            totalPrice: this.state.totalPrice + INGREDIENT_PRICES[type]
        });
        this.updatePurchaseState(updatedIngredients);
    }

    removeIngredientHandler = (type) => {
        const oldCount = this.state.ingredients[type];
        if (oldCount <= 0) {
            return;
        }
        const updatedIngredients = {
            ...this.state.ingredients
        };
        updatedIngredients[type] = oldCount - 1;
        
        this.setState({
            ingredients: updatedIngredients,
            totalPrice: this.state.totalPrice - INGREDIENT_PRICES[type]
        });
        this.updatePurchaseState(updatedIngredients);
    }

    purchaseHandler = () => {
        this.setState({purchasing: true});
    }

    purchaseCancelHandler = () => {
        this.setState({purchasing: false});
    }

    purchaseContinueHandler = () => {
        this.setState({ loading: true });
        const order = {
            ingredients: this.state.ingredients,
            customer: {
                name: 'Max',
                address: {
                    street: 'Test Street 1',
                    zipCode: '41351',
                    country: 'Germany'
                },
                email: 'test@test.com'
            },
            deliveryMethod: 'fastest',
            price: this.state.totalPrice  //would recalculate the price on the server
        };

        axios.post(
            '/orders.json',
            order
        ).then(response => {
            this.setState({loading: false, purchasing: false});
        }).catch(error => this.setState({loading: false, purchasing: false}));
    }

    render() {
        const disabledInfo = {
            ...this.state.ingredients
        };

        for (let key in disabledInfo) {
            disabledInfo[key] = (disabledInfo[key] <= 0);
        }
        let orderSummary = <OrderSummary
        price={this.state.totalPrice}
        ingredients={this.state.ingredients}
        purchaseCancelled={this.purchaseCancelHandler}
        purchaseContinued={this.purchaseContinueHandler} />

        if (this.state.loading) {
            orderSummary = <Spinner />
        }

        return (
            <Aux>
                <Modal show={this.state.purchasing} modalClosed={this.purchaseCancelHandler}>
                    {orderSummary}
                </Modal>
                <Burger ingredients={this.state.ingredients} />
                <BuildControls
                    price={this.state.totalPrice}
                    purchasable={this.state.purchasable}
                    disabled={disabledInfo}
                    ingredientAdded={this.addIngredientHandler}
                    ordered={this.purchaseHandler}
                    ingredientRemoved={this.removeIngredientHandler} />
            </Aux>
        );
    }
}

export default BurgerBuilder;