import { Notify } from 'quasar';

Notify.setDefaults({
    position: 'top-right',
    timeout: 2500,
    textColor: 'white',
    color: 'positive',
    actions: [{ icon: 'close', color: 'white' }],
});
