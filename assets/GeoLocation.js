const getCurrentPosition = (success, error, options) => {
    const currPosMsg = { event: 'getCurrentPosition', options };
    postMessage(currPosMsg);
    addEventListener('currentPosition', success, 'currentPositionError', error);
};

const watchPosition = (success, error, options) => {
    const msg = { event: 'watchPosition', options };
    postMessage(msg);
    addEventListener('watchPosition', success, 'watchPositionError', error);
};

const clearWatch = (watchID) => {
    const clearWatchMsg = { event: 'clearWatch', watchID };
    postMessage(clearWatchMsg);
};

const addEventListener = (successEvent, success, errorEvent, error) => {
    window.addEventListener('message', (e) => {
        try {
            const eventData = JSON.parse(e.data);
            const handleEvent = (eventData.event === successEvent) ? success : ( 
                eventData.event === errorEvent ? error : () => null
            );
            handleEvent(eventData.data)
          } catch (e) {
            // ignore
          }
    });
}

const postMessage = msg => {
    window.ReactNativeWebView.postMessage(JSON.stringify(msg));
}

const process = () => {
    navigator.geolocation = {
        ...navigator.geolocation,
        currentPosition,
        watchPosition,
        clearWatch,
    }
    true;
}