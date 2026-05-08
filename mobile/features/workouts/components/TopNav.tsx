import { View, StyleSheet, Text, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export function TopNav() {
    return (
        <View>
            <View style={styles.container}>
                <Text style={styles.selection}>Summary</Text>
                <Text style={styles.selection}>History</Text>
                <Text style={styles.selection}>Add new</Text>
        </View>
        <LinearGradient
            colors={[
                "rgba(0,0,0,0)",
                "rgba(0,0,0,1)",
                "rgba(0,0,0,0)"
            ]}
            locations={[0.10, 0.45, 0.99]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.divider}
        />
        </View>
        
        
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 3,
        display: "flex",
        justifyContent: "space-around",
        flexDirection: "row",
        marginTop: 25
    },
    selection: {
        color: "white",
        fontSize: 14,
        fontWeight: "900",
        letterSpacing: 1,
        textTransform: "uppercase",
        padding: 10,
        width: "30%",
        height: 40,
        borderWidth: 2,         
        borderColor: 'black',    
        borderStyle: 'solid',
        borderRadius: 8,
        backgroundColor: "black",
        alignItems: "center",
        textAlign: "center"
    },
    divider: {
        height: 4,
        width: "100%",
        marginTop: 10
    }
})