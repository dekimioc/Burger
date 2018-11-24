import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import Input from '../../components/UI/Forms/Input/Input';
import Button from '../../components/UI/Button/Button';
import Spinner from '../../components/UI/Spinner/Spinner';
import classes from './Authentication.css';
import * as actions from '../../store/actions/index';

class Authentication extends Component {
    state = {
        controls: {
            email: {
                elementType: "input",
                elementConfig: {
                    type: "email",
                    placeholder: "E-mail"
                },
                value: "",
                validation: {
                   required: true,
                   isEmail: true
                },
                valid: false,
                touched: false
            },
            password: {
                elementType: "input",
                elementConfig: {
                    type: "password",
                    placeholder: "Password"
                },
                value: "",
                validation: {
                   required: true,
                   minLength: 6
                },
                valid: false,
                touched: false
            }
        },
        isSignup: true
    };

    componentDidMount() {
        if(!this.props.buildingBurger && this.props.authenticationRedirectPath !== "/") {
            this.props.onSetAuthenticationRedirectPath();
        }
    };

    checkValidation(value, rules) {
        let isValid = true;
        if(!rules) {
            return true;   //Fixed bug in dropdown menu!
        }

        if (rules.required) {
            isValid = value.trim() !== '' && isValid;
        }

        if(rules.minLength) {
            isValid = value.length >= rules.minLength && isValid;
        }

        if(rules.maxLength) {
            isValid = value.length <= rules.maxLength && isValid;
        }

        if (rules.isEmail) {
            const pattern = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
            isValid = pattern.test(value) && isValid
        }

        if (rules.isNumeric) {
            const pattern = /^\d+$/;
            isValid = pattern.test(value) && isValid
        }

        return isValid;
    }

    inputChangedHandler = (event, controlName) => {
        const updatedControls = {
            ...this.state.controls,
            [controlName]: {
                ...this.state.controls[controlName],
                value: event.target.value,
                valid: this.checkValidation(event.target.value, this.state.controls[controlName].validation),
                touched: true
            }
        }
        this.setState({controls: updatedControls})
    };

    submitHandler = (event) => {
        event.preventDefault();
        this.props.onAuthentication(this.state.controls.email.value, this.state.controls.password.value, this.state.isSignup);
    }

    switchAuthenticationModeHandler = () => {
        this.setState(prevState => {
            return {
                isSignup: !prevState.isSignup
            }
        })
    }

    render() {
        const formElementArray = [];
        for (let key in this.state.controls) {
            formElementArray.push({
                id: key,
                config: this.state.controls[key]
            })
        };

        let form = formElementArray.map(formElement => (
            <Input 
                key={formElement.id}
                elementType={formElement.config.elementType}
                elementConfig={formElement.config.elementConfig}
                value={formElement.config.value}
                invalid={!formElement.config.valid}
                shouldValidate={formElement.config.validation}
                touched={formElement.config.touched}
                changed={(event) => this.inputChangedHandler(event, formElement.id)} />
        ));

        if(this.props.loading) {
            form = <Spinner />
        }

        let errorMessage = null;

        if(this.props.error) {
            errorMessage = (
                <p>{this.props.error.message}</p>
            )
        }

        let authenticationRedirect = null;

        if(this.props.isAuth) {
           authenticationRedirect = <Redirect to={this.props.authenticationRedirectPath} />;
        };

        return (
            <div className={classes.Authentication}>
            {authenticationRedirect}
            {errorMessage}
                <form onSubmit={this.submitHandler}>
                    {form}
                    <Button btnType="Success">SUBMIT</Button>
                </form>
                <Button 
                    clicked={this.switchAuthenticationModeHandler}
                    btnType="Danger">SWITCH TO {this.state.isSignup ? "SIGNIN" : "SIGNUP"}</Button>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        loading: state.authentication.loading,
        error: state.authentication.error,
        isAuth: state.authentication.token !== null,
        buildingBurger: state.burgerBuilder.building,
        authenticationRedirectPath: state.authentication.authenticationRedirectPath
    }
}

const mapDispatchToProps = dispatch => {
    return {
        onAuthentication: (email, password, isSignup) => dispatch(actions.authentication(email, password, isSignup)),
        onSetAuthenticationRedirectPath: () => dispatch(actions.setAuthenticationRedirectPath('/'))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Authentication);