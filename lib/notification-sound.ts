// صوت الإشعارات المحسن
import { Howl } from 'howler';

let notificationSound: Howl | null = null;
let audioContext: AudioContext | null = null;

// تهيئة الصوت مع إذن المستخدم
export const initializeSound = async (): Promise<boolean> => {
  try {
    // طلب إذن من المستخدم لتشغيل الصوت
    if (typeof window !== 'undefined') {
      // إنشاء AudioContext للتأكد من عمل الصوت
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      // إنشاء ملف الصوت
      notificationSound = new Howl({
        src: ['/sounds/new-notification-022-370046.mp3'],
        volume: 1.0,
        preload: true,
        html5: true, // استخدام HTML5 Audio API
        onloaderror: (id, error) => {
          console.error('خطأ في تحميل الصوت:', error);
          // استخدام صوت النظام كبديل
          createSystemBeep();
        },
        onload: () => {
          console.log('تم تحميل صوت الإشعار بنجاح');
        }
      });
      
      return true;
    }
    return false;
  } catch (error) {
    console.error('فشل في تهيئة الصوت:', error);
    return false;
  }
};

// إنشاء صوت النظام كبديل
const createSystemBeep = () => {
  if (typeof window !== 'undefined') {
    // استخدام Web Audio API لإنشاء صوت
    try {
      const context = audioContext || new AudioContext();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      
      oscillator.frequency.value = 800; // تردد عالي
      gainNode.gain.setValueAtTime(0.3, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);
      
      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.5);
    } catch (e) {
      console.log('فشل في إنشاء صوت النظام');
    }
  }
};

// تشغيل صوت الإشعار المحسن
export const playNotificationSound = async () => {
  try {
    // تهيئة الصوت إذا لم يكن متاحاً
    if (!notificationSound) {
      await initializeSound();
    }
    
    if (notificationSound && notificationSound.state() === 'loaded') {
      notificationSound.play();
      console.log('تم تشغيل صوت الإشعار');
    } else {
      // استخدام الصوت البديل
      createSystemBeep();
      console.log('تم استخدام الصوت البديل');
    }
    
    // إشعار المتصفح كبديل إضافي
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('طلب جديد!', {
        body: 'تم استلام طلب جديد',
        icon: '/icon-192.png',
        tag: 'new-order'
      });
    }
  } catch (error) {
    console.error('خطأ في تشغيل الصوت:', error);
    // صوت بديل أخير
    createSystemBeep();
  }
};

// طلب إذن الإشعارات
export const requestNotificationPermission = async (): Promise<boolean> => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};
