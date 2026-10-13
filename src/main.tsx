import { PlaybackPlugin, type PluginViewProps } from "mo-sdk";
import { EmotivView } from "./components/EmotivView";
import { EmotivPreview } from "./components/EmotivPreview";

export default class EmotivPlayback extends PlaybackPlugin {
    
    getView(props: PluginViewProps) {
        return <EmotivView {...props} />;
    }

    getPreview() {
        return <EmotivPreview />;
    }

    validExtensions() {
        return ["json"];
    }
    
    validateCaptureDescriptor(descriptor: Record<string, unknown> | null): boolean {
        if (!descriptor) 
            return true;

        if (descriptor.type === "array" || descriptor.type === "object") {
            return true; 
        }
        
        return true; 
    }
}