import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://react-practice-5b762.firebaseio.com/'
});

export default instance;