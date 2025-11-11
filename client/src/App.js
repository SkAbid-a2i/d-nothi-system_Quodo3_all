              <Route path="/collaboration" element={
                <ProtectedRoute>
                  <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
                </ProtectedRoute>
              }>
                <Route index element={<CollaborationLink />} />
              </Route>
              
              <Route path="/kanban" element={
                <ProtectedRoute>
                  <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
                </ProtectedRoute>
              }>
                <Route index element={<KanbanBoard />} />
              </Route>
              
              {/* Fallback route for debugging */}
              <Route path="*" element={
                <div>
                  <h1>404 - Page Not Found</h1>
                  <p>This is a fallback route for debugging purposes.</p>
                  <p>If you see this page, the routing is not working correctly.</p>
                </div>
              } />