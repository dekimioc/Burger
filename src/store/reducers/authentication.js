import * as actionTypes from '../actions/actionTypes';
import { updateObject } from '../utility';
  
const initialState = {
    token: null,
    userId: null,
    error: null,
    loading: false,
    authenticationRedirectPath: "/"
};

const autneticationStart = (state, action) => {
    return updateObject(state, {error: null, loading: true} );
}

const authenticationSuccess = (state, action) => {
    return updateObject(state, {
        token: action.idToken,
        userId: action.userId,
        error: null,
        loading: false
    })
};

const authenticationFailed = (state, action) => {
    return updateObject(state, {
        error: action.error,
        loading: false
    })
};

const authenticationLogout = (state, action) => {
    return updateObject(state, {
        token: null,
        userId: null
    })
};

const setAuthenticationRedirectPath = (state, action) => {
    return updateObject(state, {
        authenticationRedirectPath: action.path
    })
}

const reducer = (state=initialState, action) => {
    switch(action.type) {
        case actionTypes.AUTHENTICATION_START: return autneticationStart(state, action);
        case actionTypes.AUTHENTICATION_SUCCES: return authenticationSuccess(state, action);
        case actionTypes.AUTHENTICATION_FAILED: return authenticationFailed(state, action);
        case actionTypes.AUTHENTICATION_LOGOUT: return authenticationLogout(state, action);
        case actionTypes.SET_AUTHENTICATION_REDIRECT_PATH: return setAuthenticationRedirectPath(state, action);
        default: return state;
        
    }
}

export default reducer;