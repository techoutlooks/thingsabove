/***
 * Adapted from
 * https://baptiste.devessier.fr/writing/youtube-player-for-react-native-that-also-works-on-the-web/
 * https://lonelycpp.github.io/react-native-youtube-iframe/basic-usage/
 * https://developers.google.com/youtube/iframe_api_reference
 * yarn add react-native-youtube-iframe react-native-webview
 */
import React, { useRef, useImperativeHandle, forwardRef } from "react";
import YoutubePlayer, { YoutubeIframeRef } from "react-native-youtube-iframe";


type Props = {
    height: number;
    width: number;
    uri: string;
    playing: boolean;
}

interface PlayerRef {
    getDuration(): Promise<number>;
}


const extractVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : undefined;
};


export default forwardRef<PlayerRef, Props>(
    ({ width, height, uri, playing }, ref) => {

        const playerRef = useRef<YoutubeIframeRef>(null);
        useImperativeHandle(ref, () => ({
            async getDuration() {
                const duration = await playerRef.current?.getDuration();
                if (duration === undefined) { throw new Error(
                    "Could not get duration from react-native-youtube-iframe"); }
                return duration;
            },
        }));
        return (
            <YoutubePlayer
                ref={playerRef}
                videoId={extractVideoId(uri)}
                height={height}
                width={width}
                play={playing}
            />
        );
    }
);
