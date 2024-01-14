import { DeviceMotion, Gyroscope } from "expo-sensors";
import { useEffect, useState } from "react";

export const useGyroscope = (interval: number = 10) => {
  const [{ x, y, z }, setData] = useState({
    x: 0,
    y: 0,
    z: 0,
  });
  const [subscription, setSubscription] = useState<any>(null);

  const _subscribe = () => {
    setSubscription(
      DeviceMotion.addListener((motionData: any) => {
        setData({
          z: motionData.rotationRate.alpha,
          x: motionData.rotationRate.beta,
          y: motionData.rotationRate.gamma,
        });
      })
    );
  };

  const _unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  useEffect(() => {
    _subscribe();
    DeviceMotion.setUpdateInterval(interval);
    return () => _unsubscribe();
  }, []);

  return {
    x,
    y,
    z,
  };
};
