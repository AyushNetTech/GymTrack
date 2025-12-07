import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Portal, Dialog } from 'react-native-paper';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSignIn: () => void;
  email?: string;
};

export default function EmailExistsDialog({ visible, onClose, onSignIn, email }: Props) {
  if (!visible) return null;

  return (
    <Portal>
      <Dialog visible={visible} dismissable onDismiss={onClose} style={styles.dialog}>
        <Dialog.Title style={styles.title}>Email Already Registered</Dialog.Title>
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
  dialog: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: "#eee"
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    color:"black"
  },
  content: {
    alignItems: 'center',
    paddingVertical: 16,
    color:"black"
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#000000ff',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  btn: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    marginHorizontal: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  cancel: {
    backgroundColor: '#f0f0f0',
  },
  signIn: {
    backgroundColor: '#2e86de',
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
  },
});
