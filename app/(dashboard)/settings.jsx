import { StyleSheet, Text } from 'react-native'
import { useUser } from '../../hooks/useUser'

import Spacer from "../../components/Spacer"
import ThemedText from "../../components/ThemedText"
import ThemedView from "../../components/ThemedView"
import ThemedButton from '../../components/ThemedButton'

const Settings = () => {

    const { logout, user } = useUser()

    return (
        <ThemedView style={styles.container}>

            <ThemedText title={true} style={styles.heading}>
                {user.email}
            </ThemedText>
            <Spacer />
            <ThemedButton
                title="Logout"
                onPress={logout}
                style={styles.button}
            />

        </ThemedView>
    )
}

export default Settings

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    heading: {
        fontWeight: "bold",
        fontSize: 18,
        textAlign: "center",
    },
})

