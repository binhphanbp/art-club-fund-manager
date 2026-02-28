import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface WelcomeEmailProps {
  memberName: string;
  departmentName: string;
  dashboardUrl: string;
}

const departmentEmoji: Record<string, string> = {
  'Ca hát': '🎤',
  Nhảy: '💃',
  Rap: '🎧',
  'Nhạc cụ': '🎸',
};

export default function WelcomeEmail({
  memberName = 'Thành viên',
  departmentName = 'Ca hát',
  dashboardUrl = 'https://example.com/dashboard',
}: WelcomeEmailProps) {
  const emoji = departmentEmoji[departmentName] ?? '🎭';

  return (
    <Html>
      <Head />
      <Preview>
        Chào mừng {memberName} đến với CLB Nghệ Thuật! Đơn đăng ký của bạn đã được duyệt.
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logo}>🎭 CLB Nghệ Thuật</Text>
          </Section>

          {/* Hero section */}
          <Section style={hero}>
            <Text style={welcomeBadge}>🎉 Chào mừng thành viên mới!</Text>
            <Heading style={h1}>Xin chào, {memberName}!</Heading>
            <Text style={subtitle}>
              Chúng tôi rất vui khi bạn đã chính thức trở thành thành viên của{' '}
              <strong>CLB Nghệ Thuật</strong>. Đơn đăng ký của bạn đã được Admin duyệt thành công!
            </Text>
          </Section>

          {/* Department badge */}
          <Section style={infoSection}>
            <Text style={infoLabel}>Bộ môn của bạn</Text>
            <Text style={deptBadge}>
              {emoji} {departmentName}
            </Text>
          </Section>

          <Hr style={divider} />

          {/* What's next */}
          <Section style={stepsSection}>
            <Heading as="h2" style={h2}>
              Những điều cần biết
            </Heading>

            {[
              {
                icon: '💰',
                title: 'Quỹ câu lạc bộ',
                desc: 'Bạn cần đóng quỹ hàng tháng theo quy định của CLB. Xem lịch sử và trạng thái đóng quỹ trong dashboard.',
              },
              {
                icon: '📊',
                title: 'Dashboard cá nhân',
                desc: 'Theo dõi tình trạng đóng quỹ, xem thông báo và cập nhật thông tin cá nhân qua dashboard.',
              },
              {
                icon: '📅',
                title: 'Họp định kỳ',
                desc: 'CLB tổ chức họp định kỳ hàng tháng. Admin sẽ thông báo lịch qua email và kênh liên lạc chính thức.',
              },
            ].map((step, i) => (
              <Section key={i} style={stepItem}>
                <Text style={stepIcon}>{step.icon}</Text>
                <Section style={stepContent}>
                  <Text style={stepTitle}>{step.title}</Text>
                  <Text style={stepDesc}>{step.desc}</Text>
                </Section>
              </Section>
            ))}
          </Section>

          <Hr style={divider} />

          {/* CTA */}
          <Section style={ctaSection}>
            <Text style={ctaText}>
              Bấm vào nút dưới đây để truy cập dashboard và bắt đầu hành trình của bạn!
            </Text>
            <Button href={dashboardUrl} style={ctaButton}>
              Vào Dashboard ngay →
            </Button>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Email này được gửi tự động từ hệ thống quản lý quỹ CLB Nghệ Thuật.
              <br />
              Nếu có thắc mắc, vui lòng liên hệ Admin trực tiếp.
            </Text>
            <Text style={footerBrand}>🎭 CLB Nghệ Thuật • Hệ thống quản lý quỹ</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const main: React.CSSProperties = {
  backgroundColor: '#0a0a0a',
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
};

const container: React.CSSProperties = {
  maxWidth: '560px',
  margin: '0 auto',
  padding: '24px 16px',
};

const header: React.CSSProperties = {
  textAlign: 'center',
  paddingBottom: '16px',
};

const logo: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: '700',
  color: '#a78bfa',
  margin: 0,
};

const hero: React.CSSProperties = {
  backgroundColor: '#141414',
  border: '1px solid #262626',
  borderRadius: '16px',
  padding: '32px 24px',
  textAlign: 'center',
};

const welcomeBadge: React.CSSProperties = {
  display: 'inline-block',
  backgroundColor: '#1a1a2e',
  border: '1px solid #7c3aed40',
  borderRadius: '99px',
  padding: '4px 16px',
  fontSize: '13px',
  color: '#a78bfa',
  marginBottom: '12px',
};

const h1: React.CSSProperties = {
  fontSize: '28px',
  fontWeight: '700',
  color: '#fafafa',
  margin: '0 0 12px',
};

const subtitle: React.CSSProperties = {
  fontSize: '15px',
  color: '#a3a3a3',
  lineHeight: '1.6',
  margin: 0,
};

const infoSection: React.CSSProperties = {
  textAlign: 'center',
  padding: '20px 0',
};

const infoLabel: React.CSSProperties = {
  fontSize: '12px',
  color: '#737373',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  margin: '0 0 8px',
};

const deptBadge: React.CSSProperties = {
  display: 'inline-block',
  backgroundColor: '#7c3aed20',
  border: '1px solid #7c3aed50',
  borderRadius: '12px',
  padding: '8px 20px',
  fontSize: '18px',
  fontWeight: '600',
  color: '#c4b5fd',
  margin: 0,
};

const divider: React.CSSProperties = {
  borderColor: '#262626',
  margin: '0',
};

const stepsSection: React.CSSProperties = {
  padding: '24px 0',
};

const h2: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#fafafa',
  margin: '0 0 16px',
};

const stepItem: React.CSSProperties = {
  display: 'flex',
  gap: '12px',
  marginBottom: '16px',
};

const stepIcon: React.CSSProperties = {
  fontSize: '24px',
  margin: '0 0 0 0',
  lineHeight: '1',
};

const stepContent: React.CSSProperties = {};

const stepTitle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#fafafa',
  margin: '0 0 4px',
};

const stepDesc: React.CSSProperties = {
  fontSize: '13px',
  color: '#737373',
  margin: 0,
  lineHeight: '1.5',
};

const ctaSection: React.CSSProperties = {
  textAlign: 'center',
  padding: '24px 0',
};

const ctaText: React.CSSProperties = {
  fontSize: '14px',
  color: '#a3a3a3',
  marginBottom: '16px',
};

const ctaButton: React.CSSProperties = {
  backgroundColor: '#7c3aed',
  color: '#ffffff',
  borderRadius: '12px',
  padding: '12px 32px',
  fontSize: '15px',
  fontWeight: '600',
  textDecoration: 'none',
  display: 'inline-block',
};

const footer: React.CSSProperties = {
  padding: '24px 0 0',
  textAlign: 'center',
};

const footerText: React.CSSProperties = {
  fontSize: '12px',
  color: '#525252',
  lineHeight: '1.6',
  margin: '0 0 8px',
};

const footerBrand: React.CSSProperties = {
  fontSize: '12px',
  color: '#404040',
  margin: 0,
};
