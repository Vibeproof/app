import rest from '@feathersjs/rest-client';
import { createClient } from '@vibeproof/api';


const connection = rest(process.env.REACT_APP_API_URL || 'http://localhost:3030')
    .fetch(window.fetch.bind(window));

export const client = createClient(connection);
