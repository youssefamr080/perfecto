// صوت الإشعارات المحسن
import { Howl } from 'howler';

let notificationSound: Howl | null = null;
let audioContext: AudioContext | null = null;
let isAudioEnabled = false;

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
      
      // إنشاء ملف الصوت مع إعدادات محسنة
      notificationSound = new Howl({
        src: ['/sounds/new-notification-022-370046.mp3'],
        volume: 1.0,
        preload: true,
        html5: false, // استخدام Web Audio API
        format: ['mp3'],
        onloaderror: (id, error) => {
          console.error('خطأ في تحميل الصوت:', error);
          createSystemBeep();
        },
        onload: () => {
          console.log('✅ تم تحميل صوت الإشعار بنجاح');
          isAudioEnabled = true;
          // تشغيل صوت اختبار لتفعيل الصوت
          notificationSound?.play();
        },
        onplay: () => {
          console.log('🔊 يتم تشغيل صوت الإشعار');
        },
        onplayerror: (id, error) => {
          console.error('خطأ في تشغيل الصوت:', error);
          createSystemBeep();
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

// إنشاء صوت النظام كبديل قوي
const createSystemBeep = () => {
  try {
    if (typeof window !== 'undefined') {
      const context = audioContext || new AudioContext();
      
      // إنشاء نغمة متعددة لجذب الانتباه
      const createTone = (frequency: number, startTime: number, duration: number) => {
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        
        oscillator.frequency.value = frequency;
        gainNode.gain.setValueAtTime(0.3, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };
      
      // تشغيل نغمتين متتاليتين
      const now = context.currentTime;
      createTone(800, now, 0.2);
      createTone(1000, now + 0.3, 0.2);
      
      console.log('🔊 تم تشغيل صوت النظام البديل');
    }
  } catch (e) {
    console.error('فشل في إنشاء صوت النظام:', e);
  }
};

// تشغيل صوت الإشعار المحسن والقوي
export const playNotificationSound = async () => {
  try {
    console.log('🔔 محاولة تشغيل صوت الإشعار...');
    
    // تهيئة الصوت إذا لم يكن متاحاً
    if (!notificationSound || !isAudioEnabled) {
      console.log('⚠️ إعادة تهيئة الصوت...');
      await initializeSound();
    }
    
    // تجربة تشغيل الصوت الأساسي
    if (notificationSound && isAudioEnabled) {
      try {
        const playPromise = notificationSound.play();
        if (playPromise !== undefined) {
          console.log('✅ تم تشغيل صوت الإشعار الأساسي');
        }
      } catch (playError) {
        console.warn('⚠️ فشل تشغيل الصوت الأساسي، استخدام البديل');
        createSystemBeep();
      }
    } else {
      console.warn('⚠️ الصوت الأساسي غير متاح، استخدام البديل');
      createSystemBeep();
    }
    
    // إشعار المتصفح كدعم إضافي
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🛒 طلب جديد!', {
        body: 'تم استلام طلب جديد في المتجر',
        icon: '/icon-192.png',
        tag: 'new-order',
        requireInteraction: true,
        silent: false
      });
      console.log('📱 تم إرسال إشعار المتصفح');
    }
    
    // اهتزاز الجهاز إذا كان متاحاً
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
      console.log('📳 تم تفعيل اهتزاز الجهاز');
    }
    
  } catch (error) {
    console.error('❌ خطأ في تشغيل الصوت:', error);
    // محاولة أخيرة مع الصوت البديل
    createSystemBeep();
  }
};

// طلب إذن الإشعارات مع معالجة أفضل
export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      console.log('🔔 إذن الإشعارات:', permission);
      return permission === 'granted';
    }
    return false;
  } catch (error) {
    console.error('خطأ في طلب إذن الإشعارات:', error);
    return false;
  }
};

// تشغيل صوت اختبار
export const testSound = async () => {
  console.log('🧪 اختبار الصوت...');
  await playNotificationSound();
};
