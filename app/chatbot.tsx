import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { API } from '../constants/Config';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

export default function Chatbot() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: "Hello! I am HumAI. Ask me about rice diseases, treatments, or prevention tips.", sender: 'bot' },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Auto-scroll to bottom whenever messages change
  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (inputText.trim() === '') return;

    const userMsg: Message = { id: Date.now().toString(), text: inputText, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    const userQuery = inputText;
    setInputText('');
    setIsTyping(true);

    try {
      const response = await fetch(`${API.BASE_URL}/backend/chatbot_handler.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userQuery }),
      });

      const result = await response.json();
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: result.reply,
        sender: 'bot',
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      setMessages(prev => [...prev, { id: 'err', text: "Connection error. Please check your XAMPP server.", sender: 'bot' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderItem = ({ item }: { item: Message }) => (
    <View style={[styles.msgBubble, item.sender === 'user' ? styles.userBubble : styles.botBubble]}>
      <Text style={[styles.msgText, item.sender === 'user' ? styles.userText : styles.botText]}>{item.text}</Text>
    </View>
  );

  return (
    <LinearGradient colors={["#1EBA56", "#143B28"]} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="chevron-back" size={28} color="#fff" /></TouchableOpacity>
        <Text style={styles.headerTitle}>HumAI Chatbot</Text>
        <View style={{ width: 28 }} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listPadding}
      />

      {isTyping && (
        <View style={styles.typingIndicator}>
          <ActivityIndicator size="small" color="#fff" />
          <Text style={styles.typingText}> HumAI is analyzing...</Text>
        </View>
      )}

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={90}>
        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            placeholder="Type your question..."
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <Ionicons name="send" size={24} color="#1EBA56" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 50, paddingBottom: 15, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.2)' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  listPadding: { padding: 20, paddingBottom: 30 },
  msgBubble: { padding: 14, borderRadius: 18, marginBottom: 12, maxWidth: '85%' },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#fff', borderBottomRightRadius: 2 },
  botBubble: { alignSelf: 'flex-start', backgroundColor: '#143B28', borderBottomLeftRadius: 2, borderWidth: 1, borderColor: '#1EBA56' },
  msgText: { fontSize: 15, lineHeight: 20 },
  userText: { color: '#143B28' },
  botText: { color: '#fff' },
  inputArea: { flexDirection: 'row', padding: 15, backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, alignItems: 'center' },
  input: { flex: 1, height: 45, backgroundColor: '#f2f2f2', borderRadius: 22, paddingHorizontal: 18, fontSize: 15 },
  sendBtn: { marginLeft: 12 },
  typingIndicator: { flexDirection: 'row', paddingHorizontal: 20, paddingBottom: 10, alignItems: 'center' },
  typingText: { color: '#fff', fontSize: 12, fontStyle: 'italic' }
});