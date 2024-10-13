import type {
  User,
  ChannelSort,
  ChannelFilters,
  ChannelOptions,
} from "stream-chat";
import {
  useCreateChatClient,
  Chat,
  Channel,
  ChannelHeader,
  ChannelList,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";

import "stream-chat-react/dist/css/v2/index.css";
import "./layout.css";
import axios from "axios";
import { useEffect, useState } from "react";

const userId = "Thomas";
const userName = "Thomas";

const user: User = {
  id: userId,
  name: userName,
  image: `https://getstream.io/random_png/?name=${userName}`,
};

const sort: ChannelSort = { last_message_at: -1 };
const filters: ChannelFilters = {
  type: "messaging",
  members: { $in: [userId] },
};
const options: ChannelOptions = {
  limit: 10,
};

const response = await axios.post("http://localhost:5500/join", {
  username: userName,
});

console.log(response.data);

const userToken = response.data.token;
const apiKey = response.data.api_key;

const App =  () => {
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);

  const client = useCreateChatClient({
    apiKey,
    tokenOrProvider: userToken,
    userData: user,
  });

  useEffect(() => {
    const setupChannel = async () => {
      if (client) {
        const channelDef = client.channel('messaging', 'discuss');
        await channelDef.watch();
        setChannel(channelDef);
        setLoading(false);
      }
    };

    setupChannel();
  }, [client]);

  if (!client) return <div>Setting up client & connection...</div>;
  if (loading) return <div>Loading...</div>;

  const addSentiment = (text, sentiment) => {
    return `${text} [${sentiment}]`;
  }

  channel?.on('message.new', async event => {
    console.log("event: ", JSON.stringify(event));

    const response = await axios.post("http://localhost:5500/sentiment", {
      text: event.message.text,
    });
    
    console.log(response.data);
    const messageWithSentiment = {...event.message};
    messageWithSentiment.text = addSentiment(event.message.text, response.data.sentiment);
    
    setMessages([...messages, messageWithSentiment]);
  });

  return (
    <Chat client={client} theme="str-chat__theme-custom">
      <ChannelList filters={filters} sort={sort} options={options} />
      <Channel>
        <Window>
          <ChannelHeader />
          <MessageList messages={messages}/>
          <MessageInput />
        </Window>
        <Thread />
      </Channel>
    </Chat>
  );
};

export default App;
