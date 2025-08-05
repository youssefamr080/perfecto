// صوت الإشعارات
import { Howl } from 'howler';

// إنشاء ملف الصوت مع إمكانية التخصيص
export const notificationSound = new Howl({
  src: ['/sounds/new-notification-022-370046.mp3'],
  volume: 0.7,
  preload: true,
});

// إضافة وظيفة لتشغيل الصوت
export const playNotificationSound = () => {
  notificationSound.play();
};
