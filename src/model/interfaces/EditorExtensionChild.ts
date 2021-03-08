import Form from 'src/model/interfaces/Form';

export default interface EditorExtensionChild {
    name: string;
    parameters: {[key: string]: any};
    controls: Form;
}
