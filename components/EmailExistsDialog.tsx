import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Portal, Dialog } from 'react-native-paper';

type Props = {
  visible: boolean;
  onClose: () => void;      // when user taps "Cancel" or outside
  onSignIn: () => void;     // when user taps "Sign In" button
  email?: string;           // optional, show the email
};

export default function EmailExistsDialog({ visible, onClose, onSignIn, email }: Props) {
  if (!visible) return null;

  return (
    <Portal>
      <Dialog visible={visible} dismissable={true} onDismiss={onClose}>
        <Dialog.Title>Email Already Registered</Dialog.Title>
        <Dialog.Content style={styles.content}>
          <Text style={styles.message}>
            {email ? `"${email}" ` : ''}is already registered. Please sign in.
          </Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.btn, styles.cancel]} onPress={onClose}>
              <Text style={styles.btnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.signIn]} onPress={onSignIn}>
              <Text style={styles.btnText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </Dialog.Content>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: 'center' },
  message: { fontSize: 16, textAlign: 'center', marginBottom: 16 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  btn: { flex: 1, padding: 12, borderRadius: 6, marginHorizontal: 4, alignItems: 'center' },
  cancel: { backgroundColor: '#ccc' },
  signIn: { backgroundColor: '#2e86de' },
  btnText: { color: '#fff', fontWeight: '600' },
});
