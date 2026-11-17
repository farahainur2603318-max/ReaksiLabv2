import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Get started</h1>
          <p>
            Edit <code>src/App.tsx</code> and save to test <code>HMR</code>
          </p>
        </div>
        <button
          type="button"
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
              <a href="https://vite.dev/" target="_blank">
                <img className="logo" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li>
              <a href="https://react.dev/" target="_blank">
                <img className="button-icon" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a href="https://chat.vite.dev/" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </a>
            </li>
            <li>
              <a href="https://x.com/vite_js" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                X.com
              </a>
            </li>
            <li>
              <a href="https://bsky.app/profile/vite.dev" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

<<<<<<< HEAD
            {/* Bagian 4: Section Ajakan Belajar (CTA Section) */}
            <CtaSection onStartExploration={() => handleNavigate('bab1')} />
          </div>
        )}

        {/* ================= TAMPILAN 2: HALAMAN DEDIKASI PETA 6 MODUL ================= */}
        {currentView === 'roadmap' && (
          <div className="view-pane view-roadmap animate-fade-in">
            <ModuleRoadmap onOpenModule={(viewKey) => handleNavigate(viewKey)} isFullPage={true} />
          </div>
        )}

        {/* ================= TAMPILAN 3: BAB 1 ================= */}
        {currentView === 'bab1' && (
          <div className="view-pane view-bab1 animate-fade-in">
            <Chapter1
              onBackToHome={() => handleNavigate('home')}
              onNextChapter={() => handleNavigate('bab2')}
            />
          </div>
        )}

        {/* ================= TAMPILAN 3: BAB 2 ================= */}
        {currentView === 'bab2' && (
          <div className="view-pane view-bab2 animate-fade-in">
            <Chapter2
              onBackToHome={() => handleNavigate('home')}
              onPrevChapter={() => handleNavigate('bab1')}
              onNextChapter={() => handleNavigate('bab3')}
            />
          </div>
        )}

        {/* ================= TAMPILAN 4: BAB 3 ================= */}
        {currentView === 'bab3' && (
          <div className="view-pane view-bab3 animate-fade-in">
            <Chapter3
              onBackToHome={() => handleNavigate('home')}
              onPrevChapter={() => handleNavigate('bab2')}
              onNextChapter={() => handleNavigate('bab4')}
            />
          </div>
        )}

        {/* ================= TAMPILAN 5: BAB 4 ================= */}
        {currentView === 'bab4' && (
          <div className="view-pane view-bab4 animate-fade-in">
            <Chapter4
              onBackToHome={() => handleNavigate('home')}
              onPrevChapter={() => handleNavigate('bab3')}
              onNextChapter={() => handleNavigate('bab5')}
            />
          </div>
        )}

        {/* ================= TAMPILAN 6: BAB 5 ================= */}
        {currentView === 'bab5' && (
          <div className="view-pane view-bab5 animate-fade-in">
            <Chapter5
              onBackToHome={() => handleNavigate('home')}
              onPrevChapter={() => handleNavigate('bab4')}
              onNextChapter={() => handleNavigate('bab6')}
            />
          </div>
        )}

        {/* ================= TAMPILAN 7: BAB 6 ================= */}
        {currentView === 'bab6' && (
          <div className="view-pane view-bab6 animate-fade-in">
            <Chapter6
              onBackToHome={() => handleNavigate('home')}
              onPrevChapter={() => handleNavigate('bab5')}
              onJumpChapter={(targetKey) => handleNavigate(targetKey)}
            />
          </div>
        )}
      </main>

      {/* 3. Penutup / Footer Minimalis & Elegan (Ditampilkan selain halaman autentikasi) */}
      {currentView !== 'auth' && <Footer onNavigate={handleNavigate} />}
    </div>
  );
};

export default App;
export default App;
=======
export default App
>>>>>>> parent of 035012d (perbaiki layout)
