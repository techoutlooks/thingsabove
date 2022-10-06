import { Button } from 'react-native';
import { checkForUpdates } from '@/lib/expo';

const Settings = () => {

  const onPress = () => { checkForUpdates(true) }

  return (
    <Button onPress={onPress} />
  )
}


export default Settings
