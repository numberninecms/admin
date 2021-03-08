import EditorExtensionChild from 'src/model/interfaces/EditorExtensionChild';

export default interface EditorExtension {
    tabs: EditorExtensionChild[];
    sidebarComponents: EditorExtensionChild[];
}
