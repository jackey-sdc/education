document.addEventListener('DOMContentLoaded', function() {
    // 初始化时钟刻度
    const clock = document.querySelector('.clock');
    const marksContainer = clock.querySelector('.clock-marks');
    
    // 清除旧刻度
    while (marksContainer.firstChild) {
        marksContainer.removeChild(marksContainer.firstChild);
    }
    
    // 添加60个分钟刻度
    for (let i = 1; i <= 60; i++) {
        const mark = document.createElement('div');
        mark.className = 'mark mark-minute';
        mark.style.transform = `rotate(${i * 6}deg)`;
        marksContainer.appendChild(mark);
    }
    
    // 添加12个小时刻度
    for (let i = 0; i < 12; i++) {
        const mark = document.createElement('div');
        mark.className = 'mark mark-hour';
        mark.style.transform = `rotate(${i * 30}deg)`;
        marksContainer.appendChild(mark);
        
        // 添加小时数字
        const number = document.createElement('div');
        number.className = 'clock-number';
        number.textContent = i === 0 ? '12' : i.toString();
        const radius = 115;
        const angle = i * 30 * Math.PI / 180;
        const x = Math.sin(angle) * radius;
        const y = -Math.cos(angle) * radius;
        number.style.transform = `translate(calc(${x}px), calc(${y}px))`;
        // number.style.position = 'absolute';
        // number.style.left = '0px';
        // number.style.top = '0px';
        marksContainer.appendChild(number);
    }
    const hourSlider = document.getElementById('hour-slider');
    const minuteSlider = document.getElementById('minute-slider');
    const secondSlider = document.getElementById('second-slider');
    const hourHand = document.getElementById('hour-hand');
    const minuteHand = document.getElementById('minute-hand');
    const secondHand = document.getElementById('second-hand');
    
    // 设置默认12点位置
    hourSlider.value = 12;
    minuteSlider.value = 0;
    secondSlider.value = 0;
    
    function updateClock() {
        let hours = parseInt(hourSlider.value);
        let minutes = parseInt(minuteSlider.value);
        let seconds = parseInt(secondSlider.value);

        // 处理秒进位
        if (seconds > 59) {
            seconds = 0;
            minutes += 1;
            
            // 如果分钟超过60，则分钟归零，小时加1
            if (minutes > 59) {
                minutes = 0;
                hours += 1;
                
                // 如果小时超过12，则小时归零
                hours = hours % 12;
            }
        }
        
        // 处理分钟进位
        if (minutes > 59) {
            minutes = 0;
            hours += 1;
            
            // 如果小时超过12，则小时归零
            hours = hours % 12;
        }
        
        // // 处理小时进位（取模12）
        // hours = hours % 12;

        // 更新滑块和输入框的值
        hourSlider.value = hours;
        hourInput.value = hours;
        minuteSlider.value = minutes;
        minuteInput.value = minutes;
        secondSlider.value = seconds;
        secondInput.value = seconds;

        // 计算指针角度
        const totalSeconds = hours * 3600 + minutes * 60 + seconds;
        const totalMinutes = totalSeconds / 60;
        const totalHours = hours+totalMinutes / 60;

        const hourDegrees = (hours === 12 ? 0 : hours) * 30 + (totalMinutes % 60) * 0.5;
        const minuteDegrees = (totalMinutes % 60) * 6;
        const secondDegrees = (seconds % 60) * 6;

        hourHand.style.transform = `rotate(${hourDegrees}deg)`;
        minuteHand.style.transform = `rotate(${minuteDegrees}deg)`;
        secondHand.style.transform = `rotate(${secondDegrees}deg)`;
    }

    const hourInput = document.getElementById('hour-input');
    const minuteInput = document.getElementById('minute-input');
    const secondInput = document.getElementById('second-input');

    hourSlider.addEventListener('input', () => {
        if (hourSlider.value > 12) hourSlider.value = 0;
        hourInput.value = hourSlider.value;
        updateClock();
    });
    minuteSlider.addEventListener('input', () => {
        if (minuteSlider.value > 59) minuteSlider.value = 0;
        minuteInput.value = minuteSlider.value;
        updateClock();
    });
    secondSlider.addEventListener('input', () => {
        if (secondSlider.value > 59) secondSlider.value = 0;
        secondInput.value = secondSlider.value;
        updateClock();
    });

    hourInput.addEventListener('input', () => {
        if (hourInput.value > 12) hourInput.value = 0;
        hourSlider.value = hourInput.value;
        updateClock();
    });
    minuteInput.addEventListener('input', () => {
        // if (minuteInput.value > 59) minuteInput.value = 0;
        minuteSlider.value = minuteInput.value;
        updateClock();
    });
    secondInput.addEventListener('input', () => {
        // if (secondInput.value > 59) secondInput.value = 0;
        secondSlider.value = secondInput.value;
        updateClock();
    });

    // updateClock();
});