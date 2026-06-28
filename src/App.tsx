import React, { useState, useEffect } from "react";
import { Settings, X, Save } from "lucide-react";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import {
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { db, auth } from "./firebase";

enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const INITIAL_DATA = {
  name: "임석훈 / Lim Seok-hun",
  category: "콘텐츠/AI 인재",
  job_title_en: "AI Content Marketer",
  subtitle: "트렌드와 데이터 기반의 숏폼을 제작하는 AI 콘텐츠 마케터.",
  email: "tjrgns421@gmail.com",
  phone: "010-2591-2931",
  price_label: "희망 연봉",
  price_main: "회사내규에 따름",
  price_contact: "견적 문의: tjrgns421@gmail.com\n010-2591-2931",
  delivery: "📦 배송 안내: 부르시면 달려갑니다.",
  detail_edu: "건국대학교 글로컬캠퍼스 · 뷰티화장품과 졸업",
  detail_skills:
    "생성형 AI (Midjourney, ChatGPT, Runway), 콘텐츠 기획, 타겟 분석, 영상 편집, 바이럴 마케팅",
  detail_projects:
    "AI 기반 인스타그램 쇼츠 시리즈 기획 / AI 뷰티 광고 쇼츠 제작 / 브랜드 홍보용 숏폼 콘텐츠 기획",
  detail_specialties: "AI 숏폼 콘텐츠 제작, SNS 채널 운영, 퍼포먼스 마케팅",
  philosophy: '"1초의 시선 끌기가 10분의 설득보다 강하다."',
  profile_img: "https://picsum.photos/seed/profile/400/440",
  p1_title: "뷰티 브랜드 AI 쇼츠 매거진 시리즈",
  p1_subtitle: "조회수 100만 뷰 달성 · AI 비주얼 스토리텔링",
  p1_tags: "AI 쇼츠 시리즈, 조회수 100만, 초현실 비주얼",
  p1_video: "https://www.youtube.com/shorts/5v2Vq27m1iU",
  p1_stillcut: "https://picsum.photos/seed/p1/400/300",
  p1_prompt:
    "/imagine prompt: neon glowing jellyfish floating above a futuristic city skyline, cinematic lighting, 8k --ar 9:16 --v 6",
  p1_tools: "Midjourney, Runway Gen-2, Premiere Pro",
  p1_problem_title: "시각적 피로도",
  p1_problem_desc:
    "기존 뷰티 숏폼의 천편일률적인 제품 강조형 영상에서 오는 소비자의 피로감 증대.",
  p1_solution_title: "AI 초현실 비주얼",
  p1_solution_desc:
    "Midjourney와 Runway를 활용해 동화적이고 초현실적인 배경 내 제품 배치를 통한 시각적 환기.",
  p1_result_title: "조회수 100만 돌파",
  p1_result_desc: "시청 지속 시간 40% 증가 및 자사몰 유입률 25% 상승 기록.",
  p1_insight:
    "사람들이 숏폼에서 기대하는 것은 단순한 정보가 아니라 '경험'입니다. AI를 통해 현실에서 불가능한 시각적 경험을 제공했을 때 바이럴이 시작된다는 것을 확인했습니다.",
  p2_title: "퍼포먼스 향상 프로모션 쇼츠 영상",
  p2_subtitle: "전환율 15% 상승 · 극적인 훅(Hook) 기획",
  p2_tags: "퍼포먼스 마케팅, 전환율 15% 상승, A/B 테스트",
  p2_video: "https://www.youtube.com/shorts/3Pz2bT7M4U4",
  p2_stillcut: "https://picsum.photos/seed/p2/400/300",
  p2_prompt:
    "Create a highly engaging opening hook showing a shocked expression of a digital avatar, bold typography, vibrant colors.",
  p2_tools: "ChatGPT, ElevenLabs, CapCut",
  p2_problem_title: "낮은 초반 주목도",
  p2_problem_desc:
    "이탈률이 첫 3초에서 가장 높게 발생하여 핵심 프로모션 메시지 도달이 안됨.",
  p2_solution_title: "충격적인 페르소나 도입",
  p2_solution_desc:
    "AI 보이스와 빠른 텍스트 트랜지션을 활용해 시청각적인 충격 요소를 배치한 A/B 테스트 진행.",
  p2_result_title: "전환율 15% 상승",
  p2_result_desc:
    "첫 3초 리텐션이 60%를 넘어섰으며 최종 프로모션 링크 클릭률이 크게 상승.",
  p2_insight:
    "숏폼 광고는 미학보다 시선 강탈이 먼저여야 함을 배웠습니다. 아무리 좋은 콘텐츠도 초반 3초를 잡지 못하면 존재하지 않는 것과 같습니다.",
  p3_title: "B2B SaaS 홍보용 정보성 숏폼",
  p3_subtitle: "어려운 기능을 15초 만에 설명하는 튜토리얼 쇼츠",
  p3_tags: "정보성 쇼츠, 밈 활용, 공유수 5배",
  p3_video: "https://www.youtube.com/shorts/d2X4r1I_IJU",
  p3_stillcut: "https://picsum.photos/seed/p3/400/300",
  p3_prompt:
    "A humorous IT professional looking confused at a complex dashboard, split screen, meme style layout.",
  p3_tools: "Vrew, After Effects, Notion",
  p3_problem_title: "설명의 지루함",
  p3_problem_desc:
    "B2B 소프트웨어의 복잡한 기능을 단순한 녹화 화면으로 보여주어 흥미 저하.",
  p3_solution_title: "밈(Meme) + 기능",
  p3_solution_desc:
    "유행하는 밈 템플릿에 기능 설명을 녹여내고, AI 아바타가 유머러스하게 해설하는 포맷 적용.",
  p3_result_title: "공유수 5배 증가",
  p3_result_desc:
    "실무자들 사이에서 '공감'이 형성되며 자발적인 메신저 공유수 급증.",
  p3_insight:
    "B2B 콘텐츠도 결국 사람이 봅니다. 유머와 밈을 적절히 사용하면 딱딱한 정보도 부드럽게 스며들 수 있습니다.",
  psr_label_problem: "Problem",
  psr_label_solution: "Solution",
  psr_label_result: "Result",
  option_types: "정규직, 계약직, 인턴, 프리랜서",
  option_fields: "브랜드 기획, 콘텐츠 마케팅, AI 활용 기획, UX 기획",
  contact_label1: "이메일",
  contact_label2: "연락처",
  contact_label3: "전문 분야",
  contact_val3: "콘텐츠 마케팅 · AI 활용",
  contact_label4: "근무 가능 시점",
  contact_val4: "빠른 시일 내",
  contact_notice:
    "📦 배송 정보: 출근 가능 지역 및 시작일은 이메일로 문의해주세요. 빠른 응답을 약속드립니다.",
  contact_btn1: "장바구니",
  contact_btn2: "바로 구매 →",
  p1_duration: "1주일",
  p2_duration: "2주일",
  p3_duration: "3일",
  p1_contrib_label: "기획 및 제작",
  p1_contrib_pct: "100%",
  p2_contrib_label: "기획 및 카피라이팅",
  p2_contrib_pct: "100%",
  p3_contrib_label: "영상 템플릿 기획",
  p3_contrib_pct: "100%",

  p4_title: "커스텀 영상 생성 파이프라인 (ComfyUI)",
  p4_subtitle: "AI 워크플로우를 활용한 다중 비디오 렌더링",
  p4_tags: "ComfyUI, AI Video, Pipeline",
  p4_image: "",
  p4_video1: "https://www.youtube.com/watch?v=ScMzIvxBSi4",
  p4_desc1: "ComfyUI를 활용하여 여러 프롬프트를 동시에 처리합니다.",
  p4_video2: "https://www.youtube.com/watch?v=ScMzIvxBSi4",
  p4_desc2: "고품질 16:9 영상을 생성하는 자동화 파이프라인.",
  p4_video3: "https://www.youtube.com/watch?v=ScMzIvxBSi4",
  p4_desc3: "효율적인 비디오 생성 워크플로우를 구축했습니다.",
};

export default function App() {
  const [data, setData] = useState(INITIAL_DATA);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [editData, setEditData] = useState(INITIAL_DATA);
  const [activeType, setActiveType] = useState("정규직");
  const [activeField, setActiveField] = useState("브랜드 기획");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setUserEmail(user.email);
      } else {
        setIsAuthenticated(false);
        setUserEmail(null);
      }
    });

    const docRef = doc(db, "portfolio", "ai_marketer_data");
    const unsubData = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const savedData = docSnap.data();
          setData({ ...INITIAL_DATA, ...savedData });
          setEditData({ ...INITIAL_DATA, ...savedData });
        } else {
          // If not exists, just use INITIAL_DATA (already set in useState)
          setData(INITIAL_DATA);
          setEditData(INITIAL_DATA);
        }
      },
      (error) => {
        handleFirestoreError(
          error,
          OperationType.GET,
          "portfolio/ai_marketer_data",
        );
      },
    );

    return () => {
      unsubAuth();
      unsubData();
    };
  }, []);

  const handleAdminClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsAdminOpen(true);
  };

  const handleLogin = async (e: React.MouseEvent) => {
    e.preventDefault();
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
      alert("로그인에 실패했습니다.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const docRef = doc(db, "portfolio", "ai_marketer_data");
      await setDoc(docRef, editData);
      setIsAdminOpen(false);
      alert("저장되었습니다.");
    } catch (e) {
      handleFirestoreError(
        e,
        OperationType.WRITE,
        "portfolio/ai_marketer_data",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const MAX_WIDTH = 1000;
          const MAX_HEIGHT = 1000;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          // Compress to WebP at 60% quality to save space
          const dataUrl = canvas.toDataURL("image/webp", 0.6);
          resolve(dataUrl);
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    key: string,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const compressedBase64 = await compressImage(file);
        setEditData({ ...editData, [key]: compressedBase64 });
      } catch (error: any) {
        console.error("Error processing file:", error);
        alert("이미지 처리 중 오류가 발생했습니다.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const renderVideo = (videoUrl: string | undefined, title: string) => {
    if (!videoUrl) {
      return (
        <div className="video-placeholder-inner">
          <div className="play-btn">▶</div>
          <div style={{ fontSize: "14px", fontWeight: 600, color: "#888" }}>
            {title}
          </div>
          <div style={{ fontSize: "12px", color: "#555", marginTop: "4px" }}>
            어드민에서 유튜브 링크 또는 영상 파일을 등록해주세요
          </div>
        </div>
      );
    }
    const ytMatch = String(videoUrl).match(
      /(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    );
    if (ytMatch) {
      return (
        <iframe
          src={`https://www.youtube.com/embed/${ytMatch[1]}`}
          allowFullScreen
        ></iframe>
      );
    }
    return <video controls src={videoUrl}></video>;
  };

  const renderShortVideo = (videoUrl: string | undefined, title: string) => {
    if (!videoUrl) {
      return (
        <div className="short-video-wrap">
          <div className="short-video-placeholder">
            <div className="play-btn">▶</div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#aaa" }}>
              {title}
            </div>
            <div style={{ fontSize: "11px", color: "#666", marginTop: "8px" }}>
              유튜브 Shorts 링크를 등록해주세요
            </div>
          </div>
        </div>
      );
    }
    const ytMatch = String(videoUrl).match(
      /(?:v=|youtu\.be\/|shorts\/)([a-zA-Z0-9_-]{11})/,
    );
    if (ytMatch) {
      return (
        <div className="short-video-wrap">
          <iframe
            src={`https://www.youtube.com/embed/${ytMatch[1]}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      );
    }
    return (
      <div className="short-video-wrap">
        <video
          controls
          src={videoUrl}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        ></video>
      </div>
    );
  };

  return (
    <div className="shop-wrap">
      <div className="breadcrumb">
        <span>
          홈 &gt; {data.category} &gt;{" "}
          <span>{data.name ? data.name.split("/")[0].trim() : ""}</span>
        </span>
        <button className="admin-link" onClick={handleAdminClick}>
          <Settings size={14} /> 관리자
        </button>
      </div>

      <div className="product-grid">
        <div className="product-image-box">
          <span className="img-badge">LIMITED TALENT</span>
          <img src={data.profile_img} alt="프로필" />
          <span className="stock-badge">재고 1명 남음</span>
        </div>
        <div className="product-info">
          <div className="brand-label">{data.job_title_en}</div>
          <div className="product-name">{data.name}</div>
          <div className="product-sub">{data.subtitle}</div>
          <div className="rating-row">
            <span className="stars">★★★★★</span>
            <span className="rating-text">5.0 · 프로젝트 3건 완료</span>
          </div>
          <div className="divider"></div>
          <div style={{ marginBottom: "20px" }}>
            <div className="price-label">{data.price_label || "희망 연봉"}</div>
            <div className="price-main">
              {data.price_main || "회사내규에 따름"}
            </div>
            <div className="price-contact">
              {data.price_contact || `견적 문의: ${data.email}\n${data.phone}`}
            </div>
            <div className="price-delivery">{data.delivery}</div>
          </div>
          <div className="divider"></div>
          <div className="option-label">고용 형태 선택</div>
          <div className="option-chips">
            {(data.option_types || "정규직, 계약직, 인턴, 프리랜서")
              .split(",")
              .map((typeStr) => {
                const type = typeStr.trim();
                if (!type) return null;
                return (
                  <div
                    key={type}
                    className={`chip ${activeType === type ? "active" : ""}`}
                    onClick={() => setActiveType(type)}
                  >
                    {type}
                  </div>
                );
              })}
          </div>
          <div className="option-label">전문 분야 선택</div>
          <div className="option-chips">
            {(
              data.option_fields ||
              "브랜드 기획, 콘텐츠 마케팅, AI 활용 기획, UX 기획"
            )
              .split(",")
              .map((fieldStr) => {
                const field = fieldStr.trim();
                if (!field) return null;
                return (
                  <div
                    key={field}
                    className={`chip ${activeField === field ? "active" : ""}`}
                    onClick={() => setActiveField(field)}
                  >
                    {field}
                  </div>
                );
              })}
          </div>
          <div className="btn-row">
            <button className="btn-cart">장바구니</button>
            <button className="btn-buy">바로 구매</button>
          </div>
        </div>
      </div>

      <div className="detail-section">
        <div className="section-label">상품 상세 정보</div>
        <table className="spec-table">
          <tbody>
            <tr>
              <td>학력</td>
              <td>{data.detail_edu}</td>
            </tr>
            <tr>
              <td>핵심 역량</td>
              <td>
                <div className="skill-row">
                  {data.detail_skills?.split(",").map((skill, i) => (
                    <span key={i} className="skill-pill">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </td>
            </tr>
            <tr>
              <td>프로젝트</td>
              <td>{data.detail_projects}</td>
            </tr>
            <tr>
              <td>전문 영역</td>
              <td>{data.detail_specialties}</td>
            </tr>
            <tr>
              <td>기획 철학</td>
              <td>{data.philosophy}</td>
            </tr>
          </tbody>
        </table>

        {/* PROJECT 01 */}
        <div className="project-detail">
          <div className="project-header">
            <div className="project-num-big">01</div>
            <div className="project-title-area">
              <div className="project-title-big">{data.p1_title}</div>
              <div className="project-subtitle">{data.p1_subtitle}</div>
            </div>
          </div>
          <div className="project-tags">
            {data.p1_tags?.split(",").map((tag: string, idx: number) => (
              <span key={idx} className="ptag">
                {tag.trim()}
              </span>
            ))}
          </div>

          <div className="shorts-container">
            <div className="flex flex-col gap-5 w-full max-w-[320px] mx-auto">
              {renderShortVideo(data.p1_video, "쇼츠 영상 1")}

              {data.p1_stillcut && data.p1_prompt && (
                <div className="prompt-section stacked">
                  <img
                    src={data.p1_stillcut}
                    alt="Stillcut"
                    className="prompt-image vertical"
                  />
                  <div className="prompt-content" style={{ width: "100%" }}>
                    <div className="prompt-label">AI Generation Prompt</div>
                    <div className="prompt-text">{data.p1_prompt}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="short-info-wrap">
              <div
                className="psr-grid"
                style={{ gridTemplateColumns: "1fr", marginBottom: "20px" }}
              >
                <div
                  className="psr-block"
                  style={{
                    borderRight: "none",
                    borderBottom: "0.5px solid #e5e5e5",
                  }}
                >
                  <div className="psr-label">
                    {data.psr_label_problem || "Problem"}
                  </div>
                  <div className="psr-title">{data.p1_problem_title}</div>
                  <div className="psr-desc">{data.p1_problem_desc}</div>
                </div>
                <div
                  className="psr-block"
                  style={{
                    borderRight: "none",
                    borderBottom: "0.5px solid #e5e5e5",
                  }}
                >
                  <div className="psr-label">
                    {data.psr_label_solution || "Solution"}
                  </div>
                  <div className="psr-title">{data.p1_solution_title}</div>
                  <div className="psr-desc">{data.p1_solution_desc}</div>
                </div>
                <div className="psr-block">
                  <div className="psr-label">
                    {data.psr_label_result || "Result"}
                  </div>
                  <div className="psr-title">{data.p1_result_title}</div>
                  <div className="psr-desc">{data.p1_result_desc}</div>
                </div>
              </div>

              <div className="contrib-section">
                <div className="contrib-header">
                  <div className="contrib-title">사용 기술 및 기여도</div>
                  {data.p1_duration && (
                    <div className="text-sm font-medium text-gray-500">
                      제작 소요 시간: {data.p1_duration}
                    </div>
                  )}
                </div>
                {data.p1_tools && (
                  <div style={{ marginBottom: "16px" }}>
                    <div className="skill-row">
                      {data.p1_tools
                        .split(",")
                        .map((tool: string, idx: number) => (
                          <span key={idx} className="skill-pill">
                            {tool.trim()}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
                <div className="contrib-item">
                  <div className="contrib-row">
                    <span className="contrib-label">
                      {data.p1_contrib_label || "기획 및 제작"}
                    </span>
                    <span className="contrib-pct">
                      {data.p1_contrib_pct || "100%"}
                    </span>
                  </div>
                  <div className="gauge-bg">
                    <div
                      className="gauge-fill"
                      style={{ width: data.p1_contrib_pct || "100%" }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="insight-box" style={{ flex: 1 }}>
                <div className="insight-label">INSIGHT</div>
                <span>{data.p1_insight}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="project-divider"></div>

        {/* PROJECT 02 */}
        <div className="project-detail">
          <div className="project-header">
            <div className="project-num-big">02</div>
            <div className="project-title-area">
              <div className="project-title-big">{data.p2_title}</div>
              <div className="project-subtitle">{data.p2_subtitle}</div>
            </div>
          </div>
          <div className="project-tags">
            {data.p2_tags?.split(",").map((tag: string, idx: number) => (
              <span key={idx} className="ptag">
                {tag.trim()}
              </span>
            ))}
          </div>

          <div className="shorts-container">
            <div className="flex flex-col gap-5 w-full max-w-[320px] mx-auto">
              {renderShortVideo(data.p2_video, "쇼츠 영상 2")}

              {data.p2_stillcut && data.p2_prompt && (
                <div className="prompt-section stacked">
                  <img
                    src={data.p2_stillcut}
                    alt="Stillcut"
                    className="prompt-image vertical"
                  />
                  <div className="prompt-content" style={{ width: "100%" }}>
                    <div className="prompt-label">AI Generation Prompt</div>
                    <div className="prompt-text">{data.p2_prompt}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="short-info-wrap">
              <div
                className="psr-grid"
                style={{ gridTemplateColumns: "1fr", marginBottom: "20px" }}
              >
                <div
                  className="psr-block"
                  style={{
                    borderRight: "none",
                    borderBottom: "0.5px solid #e5e5e5",
                  }}
                >
                  <div className="psr-label">
                    {data.psr_label_problem || "Problem"}
                  </div>
                  <div className="psr-title">{data.p2_problem_title}</div>
                  <div className="psr-desc">{data.p2_problem_desc}</div>
                </div>
                <div
                  className="psr-block"
                  style={{
                    borderRight: "none",
                    borderBottom: "0.5px solid #e5e5e5",
                  }}
                >
                  <div className="psr-label">
                    {data.psr_label_solution || "Solution"}
                  </div>
                  <div className="psr-title">{data.p2_solution_title}</div>
                  <div className="psr-desc">{data.p2_solution_desc}</div>
                </div>
                <div className="psr-block">
                  <div className="psr-label">
                    {data.psr_label_result || "Result"}
                  </div>
                  <div className="psr-title">{data.p2_result_title}</div>
                  <div className="psr-desc">{data.p2_result_desc}</div>
                </div>
              </div>

              <div className="contrib-section">
                <div className="contrib-header">
                  <div className="contrib-title">사용 기술 및 기여도</div>
                  {data.p2_duration && (
                    <div className="text-sm font-medium text-gray-500">
                      제작 소요 시간: {data.p2_duration}
                    </div>
                  )}
                </div>
                {data.p2_tools && (
                  <div style={{ marginBottom: "16px" }}>
                    <div className="skill-row">
                      {data.p2_tools
                        .split(",")
                        .map((tool: string, idx: number) => (
                          <span key={idx} className="skill-pill">
                            {tool.trim()}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
                <div className="contrib-item">
                  <div className="contrib-row">
                    <span className="contrib-label">
                      {data.p2_contrib_label || "기획 및 카피라이팅"}
                    </span>
                    <span className="contrib-pct">
                      {data.p2_contrib_pct || "100%"}
                    </span>
                  </div>
                  <div className="gauge-bg">
                    <div
                      className="gauge-fill"
                      style={{ width: data.p2_contrib_pct || "100%" }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="insight-box" style={{ flex: 1 }}>
                <div className="insight-label">INSIGHT</div>
                <span>{data.p2_insight}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="project-divider"></div>

        {/* PROJECT 03 */}
        <div className="project-detail">
          <div className="project-header">
            <div className="project-num-big">03</div>
            <div className="project-title-area">
              <div className="project-title-big">{data.p3_title}</div>
              <div className="project-subtitle">{data.p3_subtitle}</div>
            </div>
          </div>
          <div className="project-tags">
            {data.p3_tags?.split(",").map((tag: string, idx: number) => (
              <span key={idx} className="ptag">
                {tag.trim()}
              </span>
            ))}
          </div>

          <div className="title-img-wrap">
            <div className="video-wrap">
              {renderVideo(data.p3_video, "일반 영상 3")}
            </div>
          </div>

          {data.p3_stillcut && data.p3_prompt && (
            <div className="prompt-section">
              <img
                src={data.p3_stillcut}
                alt="Stillcut"
                className="prompt-image horizontal"
              />
              <div className="prompt-content">
                <div className="prompt-label">AI Generation Prompt</div>
                <div className="prompt-text">{data.p3_prompt}</div>
              </div>
            </div>
          )}

          <div className="psr-grid">
            <div className="psr-block">
              <div className="psr-label">
                {data.psr_label_problem || "Problem"}
              </div>
              <div className="psr-title">{data.p3_problem_title}</div>
              <div className="psr-desc">{data.p3_problem_desc}</div>
            </div>
            <div className="psr-block">
              <div className="psr-label">
                {data.psr_label_solution || "Solution"}
              </div>
              <div className="psr-title">{data.p3_solution_title}</div>
              <div className="psr-desc">{data.p3_solution_desc}</div>
            </div>
            <div className="psr-block">
              <div className="psr-label">
                {data.psr_label_result || "Result"}
              </div>
              <div className="psr-title">{data.p3_result_title}</div>
              <div className="psr-desc">{data.p3_result_desc}</div>
            </div>
          </div>

          <div className="contrib-section">
            <div className="contrib-header">
              <div className="contrib-title">사용 기술 및 기여도</div>
              {data.p3_duration && (
                <div className="text-sm font-medium text-gray-500">
                  제작 소요 시간: {data.p3_duration}
                </div>
              )}
            </div>
            {data.p3_tools && (
              <div style={{ marginBottom: "16px" }}>
                <div className="skill-row">
                  {data.p3_tools.split(",").map((tool: string, idx: number) => (
                    <span key={idx} className="skill-pill">
                      {tool.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="contrib-item">
              <div className="contrib-row">
                <span className="contrib-label">
                  {data.p3_contrib_label || "영상 템플릿 기획"}
                </span>
                <span className="contrib-pct">
                  {data.p3_contrib_pct || "100%"}
                </span>
              </div>
              <div className="gauge-bg">
                <div
                  className="gauge-fill"
                  style={{ width: data.p3_contrib_pct || "100%" }}
                ></div>
              </div>
            </div>
          </div>

          <div className="insight-box">
            <div className="insight-label">INSIGHT</div>
            <span>{data.p3_insight}</span>
          </div>
        </div>

        <div className="project-divider"></div>

        {/* PROJECT 04 */}
        <div className="project-detail">
          <div className="project-header">
            <div className="project-num-big">04</div>
            <div className="project-title-area">
              <div className="project-title-big">{data.p4_title}</div>
              <div className="project-subtitle">{data.p4_subtitle}</div>
            </div>
          </div>
          <div className="project-tags">
            {data.p4_tags?.split(",").map((tag: string, idx: number) => (
              <span key={idx} className="ptag">
                {tag.trim()}
              </span>
            ))}
          </div>

          <div style={{ marginBottom: "40px", width: "100%", aspectRatio: "16 / 9", overflow: "hidden", borderRadius: "12px", background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {data.p4_image ? (
              <img
                src={data.p4_image}
                alt="Project 4 이미지"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            ) : (
              <div style={{ color: "#888", fontSize: "16px", fontWeight: 600 }}>16:9 이미지 등록 공간</div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex flex-col gap-2">
              <div className="video-wrap" style={{ marginBottom: 0 }}>
                {renderVideo(data.p4_video1, "영상 1")}
              </div>
              {data.p4_desc1 && <div className="text-sm text-gray-600">{data.p4_desc1}</div>}
            </div>
            <div className="flex flex-col gap-2">
              <div className="video-wrap" style={{ marginBottom: 0 }}>
                {renderVideo(data.p4_video2, "영상 2")}
              </div>
              {data.p4_desc2 && <div className="text-sm text-gray-600">{data.p4_desc2}</div>}
            </div>
            <div className="flex flex-col gap-2">
              <div className="video-wrap" style={{ marginBottom: 0 }}>
                {renderVideo(data.p4_video3, "영상 3")}
              </div>
              {data.p4_desc3 && <div className="text-sm text-gray-600">{data.p4_desc3}</div>}
            </div>
          </div>
        </div>

        <div className="contact-footer">
          <div className="section-label">연락처 / Contact</div>
          <div className="contact-grid">
            <div className="contact-item">
              <div className="contact-item-label">
                {data.contact_label1 || "이메일"}
              </div>
              <div className="contact-item-val">{data.email}</div>
            </div>
            <div className="contact-item">
              <div className="contact-item-label">
                {data.contact_label2 || "연락처"}
              </div>
              <div className="contact-item-val">{data.phone}</div>
            </div>
            <div className="contact-item">
              <div className="contact-item-label">
                {data.contact_label3 || "전문 분야"}
              </div>
              <div className="contact-item-val">
                {data.contact_val3 || "마케팅 · 브랜드 기획"}
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-item-label">
                {data.contact_label4 || "근무 가능 시점"}
              </div>
              <div className="contact-item-val">
                {data.contact_val4 || "협의 가능"}
              </div>
            </div>
          </div>
          <div className="notice-box">
            {data.contact_notice ||
              "📦 배송 정보: 출근 가능 지역 및 시작일은 이메일로 문의해주세요. 빠른 응답을 약속드립니다."}
          </div>
          <div className="btn-row">
            <button className="btn-cart">
              {data.contact_btn1 || "장바구니"}
            </button>
            <button className="btn-buy">
              {data.contact_btn2 || "바로 구매 →"}
            </button>
          </div>
        </div>
      </div>

      {isAdminOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold">관리자 설정</h2>
              <button
                onClick={() => setIsAdminOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {!isAuthenticated ? (
                <div className="flex flex-col gap-4 items-center justify-center py-10">
                  <p className="text-gray-600 mb-4">
                    관리자 권한이 필요합니다.
                  </p>
                  <button
                    onClick={handleLogin}
                    className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Google 계정으로 로그인
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-8">
                  <div className="flex justify-between items-center bg-gray-100 p-4 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      로그인됨: {userEmail}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="text-sm text-red-600 font-bold hover:underline"
                    >
                      로그아웃
                    </button>
                  </div>
                  <div className="flex flex-col gap-4">
                    <h3 className="font-bold text-lg border-b pb-2">
                      공통 라벨 설정
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        Problem 라벨
                        <input
                          type="text"
                          value={editData.psr_label_problem || "Problem"}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              psr_label_problem: e.target.value,
                            })
                          }
                          className="p-2 border rounded font-normal"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        Solution 라벨
                        <input
                          type="text"
                          value={editData.psr_label_solution || "Solution"}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              psr_label_solution: e.target.value,
                            })
                          }
                          className="p-2 border rounded font-normal"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        Result 라벨
                        <input
                          type="text"
                          value={editData.psr_label_result || "Result"}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              psr_label_result: e.target.value,
                            })
                          }
                          className="p-2 border rounded font-normal"
                        />
                      </label>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4">
                    <h3 className="font-bold text-lg border-b pb-2">
                      기본 정보
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        직군 카테고리 (경로 표시용)
                        <input
                          type="text"
                          value={editData.category}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              category: e.target.value,
                            })
                          }
                          className="p-2 border rounded font-normal"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        영문 직무명 (Brand Label)
                        <input
                          type="text"
                          value={editData.job_title_en}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              job_title_en: e.target.value,
                            })
                          }
                          className="p-2 border rounded font-normal"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        이름
                        <input
                          type="text"
                          value={editData.name}
                          onChange={(e) =>
                            setEditData({ ...editData, name: e.target.value })
                          }
                          className="p-2 border rounded font-normal"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        서브타이틀
                        <input
                          type="text"
                          value={editData.subtitle}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              subtitle: e.target.value,
                            })
                          }
                          className="p-2 border rounded font-normal"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        이메일
                        <input
                          type="text"
                          value={editData.email}
                          onChange={(e) =>
                            setEditData({ ...editData, email: e.target.value })
                          }
                          className="p-2 border rounded font-normal"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        연락처
                        <input
                          type="text"
                          value={editData.phone}
                          onChange={(e) =>
                            setEditData({ ...editData, phone: e.target.value })
                          }
                          className="p-2 border rounded font-normal"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        희망 연봉 라벨
                        <input
                          type="text"
                          value={editData.price_label || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              price_label: e.target.value,
                            })
                          }
                          className="p-2 border rounded font-normal"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        희망 연봉 내용
                        <input
                          type="text"
                          value={editData.price_main || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              price_main: e.target.value,
                            })
                          }
                          className="p-2 border rounded font-normal"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        견적 문의
                        <textarea
                          value={editData.price_contact || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              price_contact: e.target.value,
                            })
                          }
                          className="p-2 border rounded font-normal h-20"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        배송 안내
                        <input
                          type="text"
                          value={editData.delivery}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              delivery: e.target.value,
                            })
                          }
                          className="p-2 border rounded font-normal"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        상세 정보 - 학력
                        <input
                          type="text"
                          value={editData.detail_edu}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              detail_edu: e.target.value,
                            })
                          }
                          className="p-2 border rounded font-normal"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        상세 정보 - 핵심 역량 (쉼표로 구분)
                        <input
                          type="text"
                          value={editData.detail_skills}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              detail_skills: e.target.value,
                            })
                          }
                          className="p-2 border rounded font-normal"
                          placeholder="예: AI 툴 활용, 책임감, 열정"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        상세 정보 - 프로젝트 목록
                        <textarea
                          value={editData.detail_projects}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              detail_projects: e.target.value,
                            })
                          }
                          className="p-2 border rounded font-normal h-20"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        상세 정보 - 전문 영역
                        <input
                          type="text"
                          value={editData.detail_specialties}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              detail_specialties: e.target.value,
                            })
                          }
                          className="p-2 border rounded font-normal"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        기획 철학
                        <textarea
                          value={editData.philosophy}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              philosophy: e.target.value,
                            })
                          }
                          className="p-2 border rounded font-normal h-24"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        선택 옵션 - 고용 형태 (쉼표로 구분)
                        <input
                          type="text"
                          value={editData.option_types || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              option_types: e.target.value,
                            })
                          }
                          className="p-2 border rounded font-normal"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        선택 옵션 - 전문 분야 (쉼표로 구분)
                        <input
                          type="text"
                          value={editData.option_fields || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              option_fields: e.target.value,
                            })
                          }
                          className="p-2 border rounded font-normal"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        프로필 이미지
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, "profile_img")}
                          className="font-normal"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <h3 className="font-bold text-lg border-b pb-2">
                      프로젝트 1
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        제목
                        <input
                          type="text"
                          value={editData.p1_title}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              p1_title: e.target.value,
                            })
                          }
                          className="p-2 border rounded font-normal"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        서브타이틀
                        <input
                          type="text"
                          value={editData.p1_subtitle}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              p1_subtitle: e.target.value,
                            })
                          }
                          className="p-2 border rounded font-normal"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        태그 (쉼표로 구분)
                        <input
                          type="text"
                          value={editData.p1_tags || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              p1_tags: e.target.value,
                            })
                          }
                          className="p-2 border rounded font-normal"
                        />
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          Problem 제목
                          <input
                            type="text"
                            value={editData.p1_problem_title || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                p1_problem_title: e.target.value,
                              })
                            }
                            className="p-2 border rounded font-normal"
                          />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          Problem 내용
                          <textarea
                            value={editData.p1_problem_desc || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                p1_problem_desc: e.target.value,
                              })
                            }
                            className="p-2 border rounded font-normal h-20"
                          />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          Solution 제목
                          <input
                            type="text"
                            value={editData.p1_solution_title || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                p1_solution_title: e.target.value,
                              })
                            }
                            className="p-2 border rounded font-normal"
                          />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          Solution 내용
                          <textarea
                            value={editData.p1_solution_desc || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                p1_solution_desc: e.target.value,
                              })
                            }
                            className="p-2 border rounded font-normal h-20"
                          />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          Result 제목
                          <input
                            type="text"
                            value={editData.p1_result_title || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                p1_result_title: e.target.value,
                              })
                            }
                            className="p-2 border rounded font-normal"
                          />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          Result 내용
                          <textarea
                            value={editData.p1_result_desc || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                p1_result_desc: e.target.value,
                              })
                            }
                            className="p-2 border rounded font-normal h-20"
                          />
                        </label>
                      </div>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        인사이트
                        <textarea
                          value={editData.p1_insight}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              p1_insight: e.target.value,
                            })
                          }
                          className="p-2 border rounded font-normal h-24"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        영상 링크 (YouTube Shorts URL)
                        <input
                          type="text"
                          value={editData.p1_video || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              p1_video: e.target.value,
                            })
                          }
                          className="p-2 border rounded font-normal"
                          placeholder="https://www.youtube.com/shorts/..."
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        스틸컷 이미지
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, "p1_stillcut")}
                          className="font-normal"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        AI 프롬프트
                        <textarea
                          value={editData.p1_prompt || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              p1_prompt: e.target.value,
                            })
                          }
                          className="p-2 border rounded font-normal"
                          placeholder="예: /imagine prompt: neon glowing jellyfish..."
                          rows={2}
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        제작 소요 시간
                        <input
                          type="text"
                          value={editData.p1_duration || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              p1_duration: e.target.value,
                            })
                          }
                          className="p-2 border rounded font-normal"
                          placeholder="예: 1주일"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        사용한 기술 / 기여도 (쉼표로 구분)
                        <input
                          type="text"
                          value={editData.p1_tools || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              p1_tools: e.target.value,
                            })
                          }
                          className="p-2 border rounded font-normal"
                          placeholder="예: Midjourney, Premiere Pro"
                        />
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          기여 역할
                          <input
                            type="text"
                            value={editData.p1_contrib_label || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                p1_contrib_label: e.target.value,
                              })
                            }
                            className="p-2 border rounded font-normal"
                            placeholder="예: 기획 및 제작"
                          />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          기여도 (%)
                          <input
                            type="text"
                            value={editData.p1_contrib_pct || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                p1_contrib_pct: e.target.value,
                              })
                            }
                            className="p-2 border rounded font-normal"
                            placeholder="예: 100%"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <h3 className="font-bold text-lg border-b pb-2">
                      프로젝트 2
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        제목
                        <input
                          type="text"
                          value={editData.p2_title || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              p2_title: e.target.value,
                            })
                          }
                          className="p-2 border rounded font-normal"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        부제목
                        <input
                          type="text"
                          value={editData.p2_subtitle || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              p2_subtitle: e.target.value,
                            })
                          }
                          className="p-2 border rounded font-normal"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        태그 (쉼표로 구분)
                        <input
                          type="text"
                          value={editData.p2_tags || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              p2_tags: e.target.value,
                            })
                          }
                          className="p-2 border rounded font-normal"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        제작 소요 시간
                        <input
                          type="text"
                          value={editData.p2_duration || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              p2_duration: e.target.value,
                            })
                          }
                          className="p-2 border rounded font-normal"
                          placeholder="예: 2주일"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        사용한 툴 (쉼표로 구분)
                        <input
                          type="text"
                          value={editData.p2_tools || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              p2_tools: e.target.value,
                            })
                          }
                          className="p-2 border rounded font-normal"
                          placeholder="예: Midjourney, ChatGPT"
                        />
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          기여 역할
                          <input
                            type="text"
                            value={editData.p2_contrib_label || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                p2_contrib_label: e.target.value,
                              })
                            }
                            className="p-2 border rounded font-normal"
                            placeholder="예: 기획 및 카피라이팅"
                          />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          기여도 (%)
                          <input
                            type="text"
                            value={editData.p2_contrib_pct || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                p2_contrib_pct: e.target.value,
                              })
                            }
                            className="p-2 border rounded font-normal"
                            placeholder="예: 100%"
                          />
                        </label>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          Problem 제목
                          <input
                            type="text"
                            value={editData.p2_problem_title || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                p2_problem_title: e.target.value,
                              })
                            }
                            className="p-2 border rounded font-normal"
                          />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          Problem 내용
                          <textarea
                            value={editData.p2_problem_desc || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                p2_problem_desc: e.target.value,
                              })
                            }
                            className="p-2 border rounded font-normal h-20"
                          />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          Solution 제목
                          <input
                            type="text"
                            value={editData.p2_solution_title || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                p2_solution_title: e.target.value,
                              })
                            }
                            className="p-2 border rounded font-normal"
                          />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          Solution 내용
                          <textarea
                            value={editData.p2_solution_desc || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                p2_solution_desc: e.target.value,
                              })
                            }
                            className="p-2 border rounded font-normal h-20"
                          />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          Result 제목
                          <input
                            type="text"
                            value={editData.p2_result_title || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                p2_result_title: e.target.value,
                              })
                            }
                            className="p-2 border rounded font-normal"
                          />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          Result 내용
                          <textarea
                            value={editData.p2_result_desc || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                p2_result_desc: e.target.value,
                              })
                            }
                            className="p-2 border rounded font-normal h-20"
                          />
                        </label>
                      </div>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        인사이트
                        <textarea
                          value={editData.p2_insight}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              p2_insight: e.target.value,
                            })
                          }
                          className="p-2 border rounded font-normal h-24"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        영상 링크 (YouTube Shorts URL)
                        <input
                          type="text"
                          value={editData.p2_video || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              p2_video: e.target.value,
                            })
                          }
                          className="p-2 border rounded font-normal"
                          placeholder="https://www.youtube.com/shorts/..."
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        스틸컷 이미지
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, "p2_stillcut")}
                          className="font-normal"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        AI 프롬프트
                        <textarea
                          value={editData.p2_prompt || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              p2_prompt: e.target.value,
                            })
                          }
                          className="p-2 border rounded font-normal"
                          placeholder="예: /imagine prompt: neon glowing jellyfish..."
                          rows={2}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <h3 className="font-bold text-lg border-b pb-2">
                      프로젝트 3
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        제목
                        <input
                          type="text"
                          value={editData.p3_title || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              p3_title: e.target.value,
                            })
                          }
                          className="p-2 border rounded font-normal"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        부제목
                        <input
                          type="text"
                          value={editData.p3_subtitle || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              p3_subtitle: e.target.value,
                            })
                          }
                          className="p-2 border rounded font-normal"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        태그 (쉼표로 구분)
                        <input
                          type="text"
                          value={editData.p3_tags || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              p3_tags: e.target.value,
                            })
                          }
                          className="p-2 border rounded font-normal"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        제작 소요 시간
                        <input
                          type="text"
                          value={editData.p3_duration || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              p3_duration: e.target.value,
                            })
                          }
                          className="p-2 border rounded font-normal"
                          placeholder="예: 3일"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        사용한 툴 (쉼표로 구분)
                        <input
                          type="text"
                          value={editData.p3_tools || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              p3_tools: e.target.value,
                            })
                          }
                          className="p-2 border rounded font-normal"
                          placeholder="예: Figma, Notion"
                        />
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          기여 역할
                          <input
                            type="text"
                            value={editData.p3_contrib_label || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                p3_contrib_label: e.target.value,
                              })
                            }
                            className="p-2 border rounded font-normal"
                            placeholder="예: 영상 템플릿 기획"
                          />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          기여도 (%)
                          <input
                            type="text"
                            value={editData.p3_contrib_pct || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                p3_contrib_pct: e.target.value,
                              })
                            }
                            className="p-2 border rounded font-normal"
                            placeholder="예: 100%"
                          />
                        </label>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          Problem 제목
                          <input
                            type="text"
                            value={editData.p3_problem_title || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                p3_problem_title: e.target.value,
                              })
                            }
                            className="p-2 border rounded font-normal"
                          />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          Problem 내용
                          <textarea
                            value={editData.p3_problem_desc || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                p3_problem_desc: e.target.value,
                              })
                            }
                            className="p-2 border rounded font-normal h-20"
                          />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          Solution 제목
                          <input
                            type="text"
                            value={editData.p3_solution_title || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                p3_solution_title: e.target.value,
                              })
                            }
                            className="p-2 border rounded font-normal"
                          />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          Solution 내용
                          <textarea
                            value={editData.p3_solution_desc || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                p3_solution_desc: e.target.value,
                              })
                            }
                            className="p-2 border rounded font-normal h-20"
                          />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          Result 제목
                          <input
                            type="text"
                            value={editData.p3_result_title || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                p3_result_title: e.target.value,
                              })
                            }
                            className="p-2 border rounded font-normal"
                          />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          Result 내용
                          <textarea
                            value={editData.p3_result_desc || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                p3_result_desc: e.target.value,
                              })
                            }
                            className="p-2 border rounded font-normal h-20"
                          />
                        </label>
                      </div>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        인사이트
                        <textarea
                          value={editData.p3_insight}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              p3_insight: e.target.value,
                            })
                          }
                          className="p-2 border rounded font-normal h-24"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        영상 링크 (YouTube URL)
                        <input
                          type="text"
                          value={editData.p3_video || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              p3_video: e.target.value,
                            })
                          }
                          className="px-3 py-2 border rounded-lg font-normal"
                          placeholder="https://www.youtube.com/watch?v=..."
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        스틸컷 이미지
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, "p3_stillcut")}
                          className="px-3 py-2 border rounded-lg font-normal"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        AI 프롬프트
                        <textarea
                          value={editData.p3_prompt || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              p3_prompt: e.target.value,
                            })
                          }
                          className="px-3 py-2 border rounded-lg font-normal"
                          placeholder="예: /imagine prompt: neon glowing jellyfish..."
                          rows={2}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <h3 className="font-bold text-lg border-b pb-2">
                      프로젝트 4
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        제목
                        <input
                          type="text"
                          value={editData.p4_title || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              p4_title: e.target.value,
                            })
                          }
                          className="p-2 border rounded font-normal"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        부제목
                        <input
                          type="text"
                          value={editData.p4_subtitle || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              p4_subtitle: e.target.value,
                            })
                          }
                          className="p-2 border rounded font-normal"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        태그 (쉼표로 구분)
                        <input
                          type="text"
                          value={editData.p4_tags || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              p4_tags: e.target.value,
                            })
                          }
                          className="p-2 border rounded font-normal"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        스틸컷 이미지
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, "p4_image")}
                          className="px-3 py-2 border rounded-lg font-normal"
                        />
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-4">
                          <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                            영상 1 링크
                            <input
                              type="text"
                              value={editData.p4_video1 || ""}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  p4_video1: e.target.value,
                                })
                              }
                              className="p-2 border rounded font-normal"
                            />
                          </label>
                          <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                            영상 1 설명
                            <textarea
                              value={editData.p4_desc1 || ""}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  p4_desc1: e.target.value,
                                })
                              }
                              className="p-2 border rounded font-normal h-24"
                            />
                          </label>
                        </div>
                        <div className="flex flex-col gap-4">
                          <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                            영상 2 링크
                            <input
                              type="text"
                              value={editData.p4_video2 || ""}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  p4_video2: e.target.value,
                                })
                              }
                              className="p-2 border rounded font-normal"
                            />
                          </label>
                          <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                            영상 2 설명
                            <textarea
                              value={editData.p4_desc2 || ""}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  p4_desc2: e.target.value,
                                })
                              }
                              className="p-2 border rounded font-normal h-24"
                            />
                          </label>
                        </div>
                        <div className="flex flex-col gap-4">
                          <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                            영상 3 링크
                            <input
                              type="text"
                              value={editData.p4_video3 || ""}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  p4_video3: e.target.value,
                                })
                              }
                              className="p-2 border rounded font-normal"
                            />
                          </label>
                          <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                            영상 3 설명
                            <textarea
                              value={editData.p4_desc3 || ""}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  p4_desc3: e.target.value,
                                })
                              }
                              className="p-2 border rounded font-normal h-24"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <h3 className="font-bold text-lg border-b pb-2">
                      연락처 / Contact
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          연락처 항목 1 제목
                          <input
                            type="text"
                            value={editData.contact_label1 || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                contact_label1: e.target.value,
                              })
                            }
                            className="p-2 border rounded font-normal"
                          />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          연락처 항목 1 내용 (이메일)
                          <input
                            type="text"
                            value={editData.email || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                email: e.target.value,
                              })
                            }
                            className="p-2 border rounded font-normal"
                          />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          연락처 항목 2 제목
                          <input
                            type="text"
                            value={editData.contact_label2 || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                contact_label2: e.target.value,
                              })
                            }
                            className="p-2 border rounded font-normal"
                          />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          연락처 항목 2 내용 (전화번호)
                          <input
                            type="text"
                            value={editData.phone || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                phone: e.target.value,
                              })
                            }
                            className="p-2 border rounded font-normal"
                          />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          연락처 항목 3 제목
                          <input
                            type="text"
                            value={editData.contact_label3 || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                contact_label3: e.target.value,
                              })
                            }
                            className="p-2 border rounded font-normal"
                          />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          연락처 항목 3 내용
                          <input
                            type="text"
                            value={editData.contact_val3 || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                contact_val3: e.target.value,
                              })
                            }
                            className="p-2 border rounded font-normal"
                          />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          연락처 항목 4 제목
                          <input
                            type="text"
                            value={editData.contact_label4 || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                contact_label4: e.target.value,
                              })
                            }
                            className="p-2 border rounded font-normal"
                          />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          연락처 항목 4 내용
                          <input
                            type="text"
                            value={editData.contact_val4 || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                contact_val4: e.target.value,
                              })
                            }
                            className="p-2 border rounded font-normal"
                          />
                        </label>
                      </div>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        배송 정보 (Notice Box)
                        <textarea
                          value={editData.contact_notice || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              contact_notice: e.target.value,
                            })
                          }
                          className="p-2 border rounded font-normal h-20"
                        />
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          버튼 1 텍스트
                          <input
                            type="text"
                            value={editData.contact_btn1 || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                contact_btn1: e.target.value,
                              })
                            }
                            className="p-2 border rounded font-normal"
                          />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          버튼 2 텍스트
                          <input
                            type="text"
                            value={editData.contact_btn2 || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                contact_btn2: e.target.value,
                              })
                            }
                            className="p-2 border rounded font-normal"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {isAuthenticated && (
              <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
                <button
                  onClick={() => setIsAdminOpen(false)}
                  className="px-6 py-2.5 rounded-lg font-medium text-gray-600 hover:bg-gray-200"
                >
                  취소
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || isUploading}
                  className="px-6 py-2.5 rounded-lg font-medium bg-black text-white hover:bg-gray-800 flex items-center gap-2 disabled:opacity-50"
                >
                  <Save size={16} />{" "}
                  {isSaving
                    ? "저장 중..."
                    : isUploading
                      ? "파일 업로드 중..."
                      : "저장"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {selectedImage && (
        <div
          className="image-modal-overlay"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="image-modal-close"
            onClick={() => setSelectedImage(null)}
          >
            <X size={32} />
          </button>
          <img
            src={selectedImage}
            alt="Full size"
            className="image-modal-content"
          />
        </div>
      )}
    </div>
  );
}
