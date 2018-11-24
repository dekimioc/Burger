import axios from 'axios';

import * as actionTypes from './actionTypes';

export const authenticationStart = () => {
    return {
        type: actionTypes.AUTHENTICATION_START
    };
};

export const authenticationSuccess = (token, userId) => {
    return {
        type: actionTypes.AUTHENTICATION_SUCCES,
        idToken: token,
        userId: userId
    };
};

export const authenticationFailed = (error) => {
    return {
        type: actionTypes.AUTHENTICATION_FAILED,
        error: error
    };
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('expirationDate');
    localStorage.removeItem('userId');
    return {
        type: actionTypes.AUTHENTICATION_LOGOUT
    }
}

export const checkAuthenticationTimeout = (expTime) => {
    return dispatch => {
        setTimeout(() => {
            dispatch(logout());
        }, expTime * 1000)
    }
}

export const authentication = (email, password, isSignup) => {
    return dispatch => {
        dispatch(authenticationStart());
        const authenticationData = {
            email: email,
            password: password,
            returnSecureToken: true
        }
        let url = "https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=AIzaSyBmPBHYh-QMCcr6TSZ6aARNCGQKbweStCU";
        if(!isSignup) {
            url = "https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=AIzaSyBmPBHYh-QMCcr6TSZ6aARNCGQKbweStCU";
        }
        axios.post(url, authenticationData)
            .then(response => {
                const expirationDate = new Date(new Date().getTime() + response.data.expiresIn * 1000);
                localStorage.setItem('token', response.data.idToken);
                localStorage.setItem('expirationDate', expirationDate);
                localStorage.setItem('userId', response.data.localId)
                dispatch(authenticationSuccess(response.data.idToken, response.data.localId));
                dispatch(checkAuthenticationTimeout(response.data.expiresIn))
            })
            .catch(error => {
                dispatch(authenticationFailed(error.response.data.error));
            })
    };
};

export const setAuthenticationRedirectPath = (path) => {
    return {
        type: actionTypes.SET_AUTHENTICATION_REDIRECT_PATH,
        path: path
    }
};

export const authenticationCheckState = () => {
    return dispatch => {
        const token = localStorage.getItem('token');
        if(!token) {
            dispatch(logout());
        } else {
            const expirationDate = new Date(localStorage.getItem('expirationDate'));
            if(expirationDate <= new Date()) {
                dispatch(logout());
            } else {
                const userId = localStorage.getItem('userId')
                dispatch(authenticationSuccess(token, userId));
                dispatch(checkAuthenticationTimeout((expirationDate.getTime() - new Date().getTime()) / 1000 ));
            }
            
        }
    }
}

