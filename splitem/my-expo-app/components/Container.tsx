import { SafeAreaView, View, ViewStyle } from 'react-native';

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle;
};

export const Container = ({ children, className = '', style }: ContainerProps) => {
  return (
    <SafeAreaView 
      className={`flex-1 bg-black ${className}`}
      style={style}
    >
      <View className="flex-1 items-center justify-center">
        {/* Grid lines */}
        <View className="absolute w-full h-full">
          {/* Horizontal grid lines */}
          <View className="absolute top-1/2 w-full h-[1px] bg-white/20" />
          <View className="absolute top-1/3 w-full h-[1px] bg-white/20" />
          <View className="absolute top-2/3 w-full h-[1px] bg-white/20" />
          {/* Vertical grid lines */}
          <View className="absolute left-1/2 h-full w-[1px] bg-white/20" />
          <View className="absolute left-1/3 h-full w-[1px] bg-white/20" />
          <View className="absolute left-2/3 h-full w-[1px] bg-white/20" />
        </View>

        {/* Concentric circles */}
        <View className="relative w-32 h-32 items-center justify-center">
          <View className="absolute w-32 h-32 rounded-full border border-white/60" />
          <View className="absolute w-24 h-24 rounded-full border border-white/60" />
          <View className="absolute w-16 h-16 rounded-full border border-white/60" />
          <View className="absolute w-8 h-8 rounded-full border border-white/60" />
          <View className="absolute w-2 h-2 rounded-full bg-white/60" />
        </View>

        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = {
  container: 'flex flex-1 m-6',
};
