import React, { useEffect, useRef, useState } from 'react';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;

function VoiceOrder({ onComplete, onClose }) {
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: 'system',
      text: '안녕하세요, 고객님. 어떤 디너를 주문하시겠습니까?',
    },
  ]);
  const [step, setStep] = useState(0);
  const [orderInfo, setOrderInfo] = useState({
    dinner: null,
    style: null,
    baguette: 4,
    champagne: 1,
  });
  const [deliveryDate, setDeliveryDate] = useState('12월 2일');

  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recog = new SpeechRecognition();
    recog.lang = 'ko-KR';
    recog.interimResults = false;
    recog.continuous = false;

    recog.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim();
      addMessage('user', transcript);
      handleUserResponse(transcript);
    };

    recog.onerror = (e) => {
      console.error(e);
      addMessage('system', '음성 인식 중 오류가 발생했습니다. 다시 시도해 주세요.');
      setListening(false);
    };

    recog.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recog;
    setStep(0);

    return () => {
      recog.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addMessage = (from, text) => {
    setMessages((prev) => [...prev, { from, text }]);
  };

  const startListening = () => {
    if (!recognitionRef.current) return;
    setListening(true);
    recognitionRef.current.start();
  };

  const handleUserResponse = (text) => {
    const t = text.replace(/\s+/g, '');

    // 0단계: 추천 요청 받기
    if (step === 0) {
      if (t.includes('맛있는') || t.includes('추천')) {
        addMessage('system', '무슨 기념일인가요? 생신, 생일 등 말씀해 주세요.');
        setStep(1);
      } else {
        addMessage('system', '맛있는 디너를 추천해 드릴까요? 기념일을 알려주세요.');
      }
      return;
    }

    // 1단계: 기념일 질문에 답변
    if (step === 1) {
      if (t.includes('생신') || t.includes('생일')) {
        if (t.includes('내일')) {
          setDeliveryDate('내일');
        } else if (t.includes('모레')) {
          setDeliveryDate('모레');
        }

        addMessage('system', '정말 축하드려요. 프렌치 디너 또는 샴페인 축제 디너는 어떠세요?');
        setStep(2);
      } else {
        addMessage('system', '어떤 기념일인지 다시 말씀해 주세요.');
      }
      return;
    }

    // 2단계: 디너 선택
    if (step === 2) {
      if (t.includes('샴페인')) {
        setOrderInfo((prev) => ({ ...prev, dinner: '샴페인 축제 디너' }));
        addMessage('system', '샴페인 축제 디너 알겠습니다. 그리고 서빙은 디럭스 스타일 어떨까요?');
        setStep(3);
      } else if (t.includes('프렌치')) {
        setOrderInfo((prev) => ({ ...prev, dinner: '프렌치 디너' }));
        addMessage('system', '프렌치 디너 알겠습니다. 그리고 서빙은 디럭스 스타일 어떨까요?');
        setStep(3);
      } else {
        addMessage('system', '발렌타인, 프렌치, 잉글리시, 샴페인 축제 디너 중에 골라주세요.');
      }
      return;
    }

    // 3단계: 스타일 선택
    if (step === 3) {
      let style = null;
      if (t.includes('심플')) style = 'simple';
      else if (t.includes('그랜드')) style = 'grand';
      else if (t.includes('디럭스')) style = 'deluxe';

      if (!style) {
        addMessage('system', '심플, 그랜드, 디럭스 중에 하나를 말씀해 주세요.');
        return;
      }

      setOrderInfo((prev) => {
        const updated = { ...prev, style };
        addMessage(
          'system',
          `네, 고객님. 디너는 ${updated.dinner || '선택된 디너'}, 서빙은 ${style} 스타일로 준비합니다. 바게트빵 개수와 샴페인 병 수를 변경하시겠어요?`
        );
        return updated;
      });

      setStep(4);
      return;
    }

    // 4단계: 바게트/샴페인 변경
    if (step === 4) {
      let newBaguette = orderInfo.baguette;
      let newChampagne = orderInfo.champagne;

      const baguetteMatch = text.match(/(바게트|바케트|빵).*(\d+)개/);
      const champagneMatch = text.match(/샴페인.*?(\d+)\s*병/);

      if (baguetteMatch) {
        const num = parseInt(baguetteMatch[2], 10);
        if (!isNaN(num)) newBaguette = num;
      }

      if (champagneMatch) {
        const num = parseInt(champagneMatch[1], 10);
        if (!isNaN(num)) newChampagne = num;
      }

      setOrderInfo((prev) => {
        const updated = {
          ...prev,
          baguette: newBaguette,
          champagne: newChampagne,
        };

        addMessage(
          'system',
          `네, 디너는 ${updated.dinner}, 서빙은 ${updated.style} 스타일, 바게트빵 ${newBaguette}개, 샴페인 ${newChampagne}병으로 주문하셨습니다. 맞으면 "맞아요"라고 말씀해 주세요.`
        );

        return updated;
      });

      setStep(5);
      return;
    }

    // 5단계: 최종 확인
    if (step === 5) {
      if (t.includes('맞아요') || t.includes('맞습니다') || t === '네') {
        addMessage('system', '추가로 필요하신 것 있으세요?');

        if (onComplete) {
          onComplete(orderInfo);
        }
        setStep(6);
      } else {
        addMessage('system', '수정이 필요하면 다시 수량을 말씀해 주세요.');
        setStep(4);
      }
      return;
    }

    // 6단계: 추가 요구 확인 후 종료 안내
    if (step === 6) {
      if (t.includes('없어요') || t.includes('없습니다') || t.includes('끝')) {
        addMessage('system', `${deliveryDate}에 주문하신 대로 보내드리겠습니다. 감사합니다.`);
        setStep(7);
      } else {
        addMessage('system', '추가로 변경할 내용이 있으면 말씀해 주세요.');
      }
    }
  };

  if (!supported) {
    return (
      <div className="voice-order">
        <p>이 브라우저에서는 음성 인식을 지원하지 않습니다. (크롬에서 시도해 보세요)</p>
        <button onClick={onClose}>닫기</button>
      </div>
    );
  }

  return (
    <div className="voice-order">
      <h2>음성 주문</h2>
      <div className="voice-log">
        {messages.map((m, idx) => (
          <div key={idx} className={m.from === 'system' ? 'msg-system' : 'msg-user'}>
            <strong>{m.from === 'system' ? '시스템' : '나'}: </strong>
            {m.text}
          </div>
        ))}
      </div>

      <div className="voice-controls">
        <button onClick={startListening} disabled={listening}>
          {listening ? '듣는 중...' : '🎙 말하기'}
        </button>
        <button onClick={onClose}>닫기</button>
      </div>
    </div>
  );
}

export default VoiceOrder;
