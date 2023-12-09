import { ComponentProps, useState } from "react";
import {
  Button,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
} from "react-native";
import { TextInput } from "react-native-gesture-handler";
import Toast from "react-native-root-toast";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useRoute } from "@react-navigation/native";
import { Controller, useForm } from "react-hook-form";
import { YStack } from "tamagui";

import { colors, DEFAULT_COORDS } from "~/constants";
import { HomeTabRouteProp } from "~/navigation/RootTabNavigator";
import { useCustomLocation } from "~/providers/CustomLocationProvider";
import { sendSlackNotibotMessage } from "~/utils/sendSlackNotibotMessage";
import { useStoresScreenNavigation } from "../../hooks/useStoresScreenNavigation";

interface Props extends ComponentProps<typeof View> {}

export function Emtpy(props: Props) {
  const tabBarHeight = useBottomTabBarHeight();
  const [hasRegisterdLocation, setHasRegisterLocation] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      text: "",
    },
  });
  const navigation = useStoresScreenNavigation();
  const {
    params: { filters },
  } = useRoute<HomeTabRouteProp>();
  const { setLocation } = useCustomLocation();
  const filtered = filters != null && Object.values(filters).length > 0;

  return hasRegisterdLocation ? (
    <View className="flex-1 justify-center self-center" {...props}>
      <Text className="text-xl">주변에 카페가 없어요.</Text>
      <Button
        title={filtered ? "필터 제거" : "강남역 주변 카페 보기"}
        onPress={() => {
          if (filtered) {
            navigation.resetFilters();
          } else {
            setLocation({
              latitude: DEFAULT_COORDS.latitude,
              longitude: DEFAULT_COORDS.longitude,
            });
          }
        }}
      />
    </View>
  ) : (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <YStack
        gap={8}
        className="w-full flex-1 justify-center self-center p-5"
        onPress={Keyboard.dismiss}
        {...props}
      >
        <Text className="text-xl">지역을 알려주세요. 카페를 등록할게요.</Text>
        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange, value } }) => {
            return (
              <TextInput
                className={`rounded border ${
                  errors.text == null ? "border-gray-300" : "border-red-500"
                } px-4 py-3`}
                placeholder="지역을 입력해주세요."
                value={value}
                onChangeText={onChange}
              />
            );
          }}
          name="text"
        />
        <Button
          title="요청"
          onPress={handleSubmit(async ({ text }) => {
            Keyboard.dismiss();

            await sendSlackNotibotMessage(
              `[지역 요청] ${text}\nfilters: ${JSON.stringify(filters)}`,
            );

            Toast.show(`${text} 지역 카페 등록을 요청했어요.`, {
              opacity: 0.7,
              backgroundColor: colors.gray900,
              hideOnPress: true,
              position: -(Math.abs(Toast.positions.BOTTOM) + tabBarHeight),
            });

            setHasRegisterLocation(true);
          })}
          disabled={isSubmitting}
        />
      </YStack>
    </KeyboardAvoidingView>
  );
}
