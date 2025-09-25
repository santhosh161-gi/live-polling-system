import axios from "axios";

const API_URL = "http://localhost:5000/api";

export const getPolls = async () => {
  const res = await axios.get(`${API_URL}/polls`);
  return res.data;
};

export const getActivePoll = async () => {
  const res = await axios.get(`${API_URL}/polls/active`);
  return res.data;
};
