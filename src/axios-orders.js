import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://my-burger-app-react-de643.firebaseio.com/'
});

export default instance;