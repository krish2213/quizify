import axios from "axios";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const subscribeUserToPush = async () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { success: false, message: "Push messaging not supported" };
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { success: false, message: "Permission not granted" };
    }
    const response = await axios.get(`${BACKEND_URL}/api/notifications/vapidPublicKey`, { withCredentials: true });
    const vapidPublicKey = response.data.publicKey;
    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey
    });
    await axios.post(`${BACKEND_URL}/api/notifications/subscribe`, subscription, { withCredentials: true });
    return { success: true, message: "Successfully subscribed to notifications!" };

  } catch (error) {
    console.error("Error subscribing to push notifications", error);
    return { success: false, message: "Failed to subscribe for notifications" };
  }
}
