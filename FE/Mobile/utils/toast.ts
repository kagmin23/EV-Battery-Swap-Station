import Toast from 'react-native-toast-message';

export const showSuccessToast = (message: string, title = 'Success!') => {
    Toast.show({
        type: 'success',
        text1: title,
        text2: message,
        position: 'top',
        topOffset: 60,
        visibilityTime: 3000,
    });
};

export const showErrorToast = (message: string, title = 'Error!') => {
    Toast.show({
        type: 'error',
        text1: title,
        text2: message,
        position: 'top',
        topOffset: 60,
        visibilityTime: 4000,
    });
};

export const showInfoToast = (message: string, title = 'Information') => {
    Toast.show({
        type: 'info',
        text1: title,
        text2: message,
        position: 'top',
        topOffset: 60,
        visibilityTime: 3000,
    });
};
