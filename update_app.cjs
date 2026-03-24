const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

const target1 = `<div className="fractal-root" style={{ marginLeft: '4rem', width: 'calc(100% - 4rem)' }}>

        <div className="fractal-sidebar">`;
const replace1 = `<div className="fractal-root" style={{ marginLeft: '4rem', width: 'calc(100% - 4rem)' }}>

        {['Mandelbrot', 'Julia', 'BurningShip', 'JuliaSpectrum'].includes(activeFractal) ? (
          <>
          <div className="fractal-sidebar">`;

const target2 = `        </div>
      </div>
    </>
  );
}`;
const replace2 = `        </div>
          </>
        ) : (
          <FractalView type={activeFractal} />
        )}
      </div>
    </>
  );
}`;

app = app.replace(target1, replace1);
app = app.replace(target2, replace2);

fs.writeFileSync('src/App.tsx', app);
console.log('Done!');